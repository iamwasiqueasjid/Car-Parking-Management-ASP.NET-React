using CarParking.Data;
using CarParking.DTOs;
using CarParking.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CarParking.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MovementController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public MovementController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpPost("record-entry")]
        public async Task<IActionResult> RecordEntry(AddVehicleDTO addVehicleDTO)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst("Role")?.Value;

            int? userId = null;
            if (userRole == "Customer" && int.TryParse(userIdClaim, out int parsedUserId))
            {
                userId = parsedUserId;
            }

            // Validate zone if provided
            if (!string.IsNullOrWhiteSpace(addVehicleDTO.Zone))
            {
                var validZones = new[] { "A", "B", "C", "VIP" };
                if (!validZones.Contains(addVehicleDTO.Zone.ToUpper()))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = $"Invalid zone. Valid zones are: {string.Join(", ", validZones)}"
                    });
                }
            }

            var vehicle = new Vehicle()
            {
                VRM = addVehicleDTO.VRM.Replace(" ", "").ToLower(),
                EntryTime = DateTime.UtcNow,
                Zone = addVehicleDTO.Zone?.ToUpper(),
                UserId = userId
            };

            await _dbContext.Vehicles.AddAsync(vehicle);
            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Vehicle entry recorded successfully",
                vehicle = vehicle
            });
        }

        [HttpPost("record-exit/{vrm}")]
        public async Task<IActionResult> RecordExit(string vrm)
        {
            try
            {
                vrm = vrm.Replace(" ", "").ToLower();

                var vehicle = await _dbContext.Vehicles
                    .FirstOrDefaultAsync(v => v.VRM == vrm && v.ExitTime == null);

                if (vehicle == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Vehicle not found or already exited."
                    });
                }

                vehicle.ExitTime = DateTime.UtcNow;

                var parkingRate = await _dbContext.ParkingRates
                    .Where(r => r.IsActive)
                    .OrderByDescending(r => r.CreatedAt)
                    .FirstOrDefaultAsync();

                if (parkingRate == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "No active parking rate found. Please contact administrator."
                    });
                }

                var duration = (vehicle.ExitTime.Value - vehicle.EntryTime).TotalHours;
                vehicle.ParkingFee = (decimal)Math.Ceiling(duration) * parkingRate.HourlyRate;

                await _dbContext.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Vehicle exit recorded successfully",
                    vehicle = new
                    {
                        vehicle.VehicleId,
                        vehicle.VRM,
                        vehicle.EntryTime,
                        vehicle.ExitTime,
                        Duration = vehicle.ExitTime.Value - vehicle.EntryTime,
                        vehicle.ParkingFee,
                        vehicle.IsPaid
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error recording vehicle exit",
                    error = ex.Message
                });
            }
        }

        [HttpGet("active-vehicles")]
        [Authorize(Policy = "OwnerOnly")]
        public async Task<IActionResult> GetActiveVehicles()
        {
            var activeVehicles = await _dbContext.Vehicles
                .Include(v => v.User)
                .Where(v => v.ExitTime == null)
                .Select(v => new
                {
                    v.VehicleId,
                    v.VRM,
                    v.EntryTime,
                    Duration = DateTime.UtcNow - v.EntryTime,
                    v.Zone,
                    CustomerName = v.User != null ? v.User.FullName : "Walk-in"
                })
                .ToListAsync();

            return Ok(activeVehicles);
        }

        [HttpGet("my-parking-history")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<IActionResult> GetMyParkingHistory()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var history = await _dbContext.Vehicles
                .Include(v => v.Payments)
                .Where(v => v.UserId == userId)
                .OrderByDescending(v => v.EntryTime)
                .Select(v => new
                {
                    v.VehicleId,
                    v.VRM,
                    v.EntryTime,
                    v.ExitTime,
                    v.ParkingFee,
                    v.IsPaid,
                    v.Zone,
                    Duration = v.ExitTime.HasValue
                        ? v.ExitTime.Value - v.EntryTime
                        : DateTime.UtcNow - v.EntryTime
                })
                .ToListAsync();

            return Ok(history);
        }

        [HttpGet("exit-logs")]
        [Authorize(Policy = "OwnerOnly")]
        public async Task<IActionResult> GetExitLogs()
        {
            var exitLogs = await _dbContext.Vehicles
                .Include(v => v.User)
                .Where(v => v.ExitTime != null)
                .OrderByDescending(v => v.ExitTime)
                .Take(50)
                .Select(v => new
                {
                    v.VehicleId,
                    v.VRM,
                    v.EntryTime,
                    v.ExitTime,
                    Duration = v.ExitTime.Value - v.EntryTime,
                    v.ParkingFee,
                    v.IsPaid,
                    Status = v.IsPaid ? "Paid" : "Pending",
                    CustomerName = v.User != null ? v.User.FullName : "Walk-in"
                })
                .ToListAsync();

            return Ok(exitLogs);
        }
    }
}