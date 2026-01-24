using CarParking.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarParking.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "OwnerOnly")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public DashboardController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var today = DateTime.UtcNow.Date;

                // Active vehicles
                var activeVehicles = await _dbContext.Vehicles
                    .Where(v => v.ExitTime == null)
                    .CountAsync();

                // Total capacity (you can make this configurable)
                var totalCapacity = 200;

                // Revenue today
                var revenueToday = await _dbContext.Payments
                    .Where(p => p.PaymentTime.Date == today)
                    .SumAsync(p => (decimal?)p.Amount) ?? 0;

                // Average duration (in hours) - Fix null reference
                var vehiclesWithExit = await _dbContext.Vehicles
                    .Where(v => v.ExitTime != null && v.EntryTime.Date == today)
                    .Select(v => (v.ExitTime!.Value - v.EntryTime).TotalHours)
                    .ToListAsync();

                var avgDuration = vehiclesWithExit.Any() ? vehiclesWithExit.Average() : 0;

                return Ok(new
                {
                    activeVehicles = new
                    {
                        count = activeVehicles,
                        change = "+12 today" // Calculate this based on yesterday's data
                    },
                    totalCapacity = new
                    {
                        capacity = totalCapacity,
                        occupied = activeVehicles,
                        percentage = Math.Round((double)activeVehicles / totalCapacity * 100, 0)
                    },
                    revenueToday = new
                    {
                        amount = revenueToday,
                        change = "+15%" // Calculate based on yesterday
                    },
                    averageDuration = new
                    {
                        hours = Math.Round(avgDuration, 1),
                        change = "-0.3 vs avg"
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error retrieving dashboard stats",
                    error = ex.Message
                });
            }
        }
    }
}