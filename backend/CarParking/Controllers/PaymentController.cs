using CarParking.Data;
using CarParking.DTOs;
using CarParking.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarParking.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public PaymentController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPaymentById(int id)
        {
            var payment = await _dbContext.Payments
                .Include(p => p.Vehicle)
                .FirstOrDefaultAsync(p => p.PaymentId == id);

            if (payment == null)
            {
                return NotFound(new { success = false, message = "Payment not found" });
            }

            return Ok(payment);
        }

        [HttpPost("process-payment/{vrm}")]
        public async Task<IActionResult> ProcessPayment(string vrm, ProcessPaymentDTO processPayment)
        {
            vrm = vrm.Replace(" ", "").ToLower();

            var vehicle = await _dbContext.Vehicles
                .Where(v => v.VRM == vrm && v.ExitTime != null)
                .OrderByDescending(v => v.ExitTime)
                .FirstOrDefaultAsync();

            if (vehicle == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Vehicle not found or hasn't exited yet"
                });
            }

            if (vehicle.IsPaid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Payment already processed for this vehicle"
                });
            }

            if (processPayment.Amount != vehicle.ParkingFee)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Payment amount does not match parking fee",
                    expectedAmount = vehicle.ParkingFee,
                    providedAmount = processPayment.Amount
                });
            }

            var paymentMethod = processPayment.PaymentMethod?.ToLower();
            if (paymentMethod != "cash" && paymentMethod != "card")
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Payment method must be 'cash' or 'card'"
                });
            }

            var payment = new Payment()
            {
                VehicleId = vehicle.VehicleId,
                Amount = processPayment.Amount,
                PaymentTime = DateTime.UtcNow,
                PaymentMethod = paymentMethod,
                PaymentType = "OnSpot"
            };

            vehicle.IsPaid = true;

            await _dbContext.Payments.AddAsync(payment);
            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Payment processed successfully",
                paymentId = payment.PaymentId,
                amount = payment.Amount,
                paymentMethod = payment.PaymentMethod,
                paymentTime = payment.PaymentTime
            });
        }

        [HttpGet("payment-summary")]
        [Authorize(Policy = "OwnerOnly")]
        public async Task<IActionResult> GetPaymentSummary()
        {
            try
            {
                var today = DateTime.UtcNow.Date;

                var paidToday = await _dbContext.Payments
                    .Where(p => p.PaymentTime.Date == today)
                    .SumAsync(p => (decimal?)p.Amount) ?? 0;

                var pendingPayments = await _dbContext.Vehicles
                    .Where(v => v.ExitTime != null && !v.IsPaid)
                    .SumAsync(v => v.ParkingFee ?? 0);

                var totalPaid = await _dbContext.Payments
                    .Where(p => p.PaymentTime.Date == today)
                    .CountAsync();

                var totalPending = await _dbContext.Vehicles
                    .Where(v => v.ExitTime != null && !v.IsPaid)
                    .CountAsync();

                return Ok(new
                {
                    paidTransactions = new
                    {
                        amount = paidToday,
                        count = totalPaid,
                        status = "Paid"
                    },
                    pendingTransactions = new
                    {
                        amount = pendingPayments,
                        count = totalPending,
                        status = "Pending"
                    },
                    totalRevenue = paidToday
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error retrieving payment summary",
                    error = ex.Message
                });
            }
        }

        [HttpGet("weekly-revenue")]
        [Authorize(Policy = "OwnerOnly")]
        public async Task<IActionResult> GetWeeklyRevenue()
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var startOfWeek = today.AddDays(-(int)today.DayOfWeek);

                var weeklyData = await _dbContext.Payments
                    .Where(p => p.PaymentTime >= startOfWeek)
                    .GroupBy(p => p.PaymentTime.Date)
                    .Select(g => new
                    {
                        Date = g.Key,
                        Revenue = g.Sum(p => p.Amount)
                    })
                    .ToListAsync();

                var result = Enumerable.Range(0, 7)
                    .Select(i => startOfWeek.AddDays(i))
                    .Select(date => new
                    {
                        Day = date.DayOfWeek.ToString(),
                        Revenue = weeklyData.FirstOrDefault(w => w.Date == date)?.Revenue ?? 0
                    })
                    .ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error retrieving weekly revenue",
                    error = ex.Message
                });
            }
        }

        [HttpPost("pay-parking-fee/{vehicleId}")]
        [Authorize(Policy = "CustomerOnly")]
        public async Task<IActionResult> PayParkingFee(int vehicleId)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized();
                }

                var vehicle = await _dbContext.Vehicles
                    .Include(v => v.User)
                    .FirstOrDefaultAsync(v => v.VehicleId == vehicleId && v.UserId == userId);

                if (vehicle == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Vehicle not found or does not belong to you"
                    });
                }

                if (vehicle.IsPaid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "This parking fee has already been paid"
                    });
                }

                if (vehicle.ExitTime == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Cannot pay for a vehicle that hasn't exited yet"
                    });
                }

                var user = await _dbContext.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "User not found"
                    });
                }

                if (user.CreditBalance < vehicle.ParkingFee)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = $"Insufficient credit balance. Required: ${vehicle.ParkingFee:F2}, Available: ${user.CreditBalance:F2}"
                    });
                }

                // Deduct from user account
                user.CreditBalance -= vehicle.ParkingFee.Value;
                vehicle.IsPaid = true;

                // Create payment record
                var payment = new Payment
                {
                    VehicleId = vehicle.VehicleId,
                    Amount = vehicle.ParkingFee.Value,
                    PaymentTime = DateTime.UtcNow,
                    PaymentMethod = "CreditBalance",
                    PaymentType = "UserAccount"
                };

                await _dbContext.Payments.AddAsync(payment);
                await _dbContext.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Parking fee paid successfully",
                    payment = new
                    {
                        paymentId = payment.PaymentId,
                        amount = payment.Amount,
                        paymentTime = payment.PaymentTime,
                        remainingBalance = user.CreditBalance
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error processing payment",
                    error = ex.Message
                });
            }
        }
    }
}