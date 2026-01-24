using CarParking.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CarParking.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "CustomerOnly")]
    public class CustomerController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public CustomerController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Get current parked vehicle (if any)
        [HttpGet("current-parking")]
        public async Task<IActionResult> GetCurrentParking()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var currentVehicle = await _dbContext.Vehicles
                .Where(v => v.UserId == userId && v.ExitTime == null)
                .Select(v => new
                {
                    v.VehicleId,
                    v.VRM,
                    v.EntryTime,
                    v.Zone,
                    Duration = DateTime.UtcNow - v.EntryTime,
                    EstimatedFee = CalculateEstimatedFee(v.EntryTime)
                })
                .FirstOrDefaultAsync();

            if (currentVehicle == null)
            {
                return Ok(new { isParked = false });
            }

            return Ok(new
            {
                isParked = true,
                vehicle = currentVehicle
            });
        }

        // Get parking history
        [HttpGet("parking-history")]
        public async Task<IActionResult> GetParkingHistory()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var history = await _dbContext.Vehicles
                .Include(v => v.Payments)
                .Where(v => v.UserId == userId && v.ExitTime != null)
                .OrderByDescending(v => v.ExitTime)
                .Select(v => new
                {
                    v.VehicleId,
                    v.VRM,
                    v.EntryTime,
                    v.ExitTime,
                    Duration = v.ExitTime.Value - v.EntryTime,
                    v.ParkingFee,
                    v.IsPaid,
                    v.Zone,
                    PaymentMethod = v.Payments.FirstOrDefault() != null
                        ? v.Payments.First().PaymentMethod
                        : null
                })
                .ToListAsync();

            return Ok(history);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetCustomerStats()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var totalVisits = await _dbContext.Vehicles
                .Where(v => v.UserId == userId)
                .CountAsync();

            var totalSpent = await _dbContext.Vehicles
                .Where(v => v.UserId == userId && v.IsPaid)
                .SumAsync(v => v.ParkingFee ?? 0);

            var currentlyParked = await _dbContext.Vehicles
                .AnyAsync(v => v.UserId == userId && v.ExitTime == null);

            var unpaidAmount = await _dbContext.Vehicles
                .Where(v => v.UserId == userId && v.ExitTime != null && !v.IsPaid)
                .SumAsync(v => v.ParkingFee ?? 0);

            return Ok(new
            {
                totalVisits,
                totalSpent,
                currentlyParked,
                unpaidAmount
            });
        }

        private decimal CalculateEstimatedFee(DateTime entryTime)
        {
            var duration = (DateTime.UtcNow - entryTime).TotalHours;
            var rate = _dbContext.ParkingRates
                .Where(r => r.IsActive)
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefault();

            if (rate == null) return 0;

            return (decimal)Math.Ceiling(duration) * rate.HourlyRate;
        }
    }
}