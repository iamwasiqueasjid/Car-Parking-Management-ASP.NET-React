using CarParking.Data;
using CarParking.DTOs;
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
                .FirstOrDefaultAsync();

            if (currentVehicle == null)
            {
                return Ok(new { isParked = false });
            }

            var duration = DateTime.UtcNow - currentVehicle.EntryTime;
            var estimatedFee = CalculateEstimatedFee(currentVehicle.EntryTime);

            return Ok(new
            {
                isParked = true,
                vehicle = new
                {
                    currentVehicle.VehicleId,
                    vrm = currentVehicle.VRM,
                    currentVehicle.EntryTime,
                    currentVehicle.Zone,
                    duration = new
                    {
                        hours = (int)duration.TotalHours,
                        minutes = duration.Minutes
                    },
                    estimatedFee
                }
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

            var vehicles = await _dbContext.Vehicles
                .Include(v => v.Payments)
                .Where(v => v.UserId == userId && v.ExitTime != null)
                .OrderByDescending(v => v.ExitTime)
                .ToListAsync();

            var history = vehicles.Select(v =>
            {
                var duration = v.ExitTime.Value - v.EntryTime;
                return new
                {
                    v.VehicleId,
                    vrm = v.VRM,
                    v.EntryTime,
                    v.ExitTime,
                    duration = new
                    {
                        hours = (int)duration.TotalHours,
                        minutes = duration.Minutes
                    },
                    v.ParkingFee,
                    v.IsPaid,
                    v.Zone,
                    paymentMethod = v.Payments.FirstOrDefault()?.PaymentMethod
                };
            }).ToList();

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

        // Get registered VRMs for current customer
        [HttpGet("registered-vrms")]
        public async Task<IActionResult> GetRegisteredVRMs()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var vrms = string.IsNullOrEmpty(user.RegisteredVRMs)
                ? new List<string>()
                : user.RegisteredVRMs.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(v => v.Trim().ToUpper())
                    .ToList();

            return Ok(vrms);
        }

        // Add a VRM to registered vehicles
        [HttpPost("add-vrm")]
        public async Task<IActionResult> AddVRM([FromBody] AddVRMRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            if (string.IsNullOrWhiteSpace(request.VRM))
            {
                return BadRequest(new { message = "VRM is required" });
            }

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var normalizedVRM = request.VRM.Replace(" ", "").ToLower();

            // Check if VRM already registered by another user
            var existingUser = await _dbContext.Users
                .Where(u => u.UserId != userId && u.RegisteredVRMs != null && u.RegisteredVRMs.Contains(normalizedVRM))
                .FirstOrDefaultAsync();

            if (existingUser != null)
            {
                return BadRequest(new { message = "This VRM is already registered by another customer" });
            }

            var vrms = string.IsNullOrEmpty(user.RegisteredVRMs)
                ? new List<string>()
                : user.RegisteredVRMs.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(v => v.Trim())
                    .ToList();

            if (vrms.Contains(normalizedVRM))
            {
                return BadRequest(new { message = "VRM already registered" });
            }

            vrms.Add(normalizedVRM);
            user.RegisteredVRMs = string.Join(",", vrms);

            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "VRM registered successfully",
                vrms = vrms.Select(v => v.ToUpper()).ToList()
            });
        }

        // Remove a VRM from registered vehicles
        [HttpDelete("remove-vrm/{vrm}")]
        public async Task<IActionResult> RemoveVRM(string vrm)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var normalizedVRM = vrm.Replace(" ", "").ToLower();

            var vrms = string.IsNullOrEmpty(user.RegisteredVRMs)
                ? new List<string>()
                : user.RegisteredVRMs.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(v => v.Trim())
                    .ToList();

            if (!vrms.Remove(normalizedVRM))
            {
                return NotFound(new { message = "VRM not found in registered vehicles" });
            }

            user.RegisteredVRMs = vrms.Count > 0 ? string.Join(",", vrms) : null;

            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "VRM removed successfully",
                vrms = vrms.Select(v => v.ToUpper()).ToList()
            });
        }

        // Get credit balance
        [HttpGet("credit-balance")]
        public async Task<IActionResult> GetCreditBalance()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new
            {
                creditBalance = user.CreditBalance
            });
        }

        // Add credits to account (simulate bank transfer)
        [HttpPost("add-credit")]
        public async Task<IActionResult> AddCredit([FromBody] AddCreditDTO addCreditDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Simulate bank transaction (in real app, integrate with payment gateway)
            // For simulation, we just add the credit
            user.CreditBalance += addCreditDto.Amount;
            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = $"Successfully added ${addCreditDto.Amount:F2} to your account",
                newBalance = user.CreditBalance
            });
        }

        // Pay parking fee using account credits
        [HttpPost("pay-parking-fee")]
        public async Task<IActionResult> PayParkingFee([FromBody] PayParkingFeeDTO payDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var vehicle = await _dbContext.Vehicles
                .FirstOrDefaultAsync(v => v.VehicleId == payDto.VehicleId && v.UserId == userId);

            if (vehicle == null)
            {
                return NotFound(new { message = "Vehicle not found or does not belong to you" });
            }

            if (vehicle.IsPaid)
            {
                return BadRequest(new { message = "This parking fee has already been paid" });
            }

            if (vehicle.ExitTime == null)
            {
                return BadRequest(new { message = "Vehicle has not exited yet" });
            }

            if (vehicle.ParkingFee == null || vehicle.ParkingFee <= 0)
            {
                return BadRequest(new { message = "No parking fee to pay" });
            }

            if (user.CreditBalance < vehicle.ParkingFee)
            {
                return BadRequest(new
                {
                    message = "Insufficient credit balance",
                    required = vehicle.ParkingFee,
                    available = user.CreditBalance,
                    shortfall = vehicle.ParkingFee - user.CreditBalance
                });
            }

            // Deduct from credit balance
            user.CreditBalance -= vehicle.ParkingFee.Value;
            vehicle.IsPaid = true;

            // Create payment record
            var payment = new Models.Payment
            {
                VehicleId = vehicle.VehicleId,
                Amount = vehicle.ParkingFee.Value,
                PaymentTime = DateTime.UtcNow,
                PaymentMethod = "credit"
            };

            _dbContext.Payments.Add(payment);
            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Payment successful",
                amountPaid = vehicle.ParkingFee,
                remainingBalance = user.CreditBalance
            });
        }
    }

    public class AddVRMRequest
    {
        public required string VRM { get; set; }
    }
}