using CarParking.Data;
using CarParking.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarParking.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ParkingRateController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public ParkingRateController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("get-rates")]
        public async Task<IActionResult> GetRates()
        {
            var rates = await _dbContext.ParkingRates
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(rates);
        }

        [HttpGet("current-rate")]
        public async Task<IActionResult> GetCurrentRate()
        {
            var currentRate = await _dbContext.ParkingRates
                .Where(r => r.IsActive)
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefaultAsync();

            if (currentRate == null)
            {
                return NotFound(new { message = "No active rate found" });
            }

            return Ok(currentRate);
        }

        [HttpPost("add-rate")]
        [Authorize(Policy = "OwnerOnly")]
        public async Task<IActionResult> AddRate(decimal HourlyRate)
        {
            if (HourlyRate <= 0)
            {
                return BadRequest(new { message = "Hourly rate must be greater than 0" });
            }

            // Use transaction to ensure consistency
            using var transaction = await _dbContext.Database.BeginTransactionAsync();
            
            try
            {
                // Deactivate old rates
                var existingRates = await _dbContext.ParkingRates
                    .Where(r => r.IsActive)
                    .ToListAsync();

                foreach (var rate in existingRates)
                {
                    rate.IsActive = false;
                }

                var parkingRate = new ParkingRate()
                {
                    HourlyRate = HourlyRate,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                await _dbContext.ParkingRates.AddAsync(parkingRate);
                await _dbContext.SaveChangesAsync();
                
                await transaction.CommitAsync();

                return Ok(new
                {
                    success = true,
                    message = "Rate updated successfully",
                    rate = parkingRate
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new
                {
                    success = false,
                    message = "Failed to update rate",
                    error = ex.Message
                });
            }
        }
    }
}