using CarParking.Data;
using CarParking.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarParking.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ParkingRateController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public ParkingRateController(ApplicationDbContext _dbContext)
        {
            dbContext = _dbContext;
        }

        [HttpGet("get-rates")]
        public async Task<IActionResult> getRates()
        {
            var rates = await dbContext.ParkingRates.ToListAsync();
            return Ok(rates);
        }

        [HttpPost("add-rate")]
        public async Task<IActionResult> addRate(decimal HourlyRate)
        {
            var ParkingRate = new ParkingRate()
            {
                HourlyRate = HourlyRate
            };
            await dbContext.ParkingRates.AddAsync(ParkingRate);
            await dbContext.SaveChangesAsync();
            return Ok(ParkingRate);
        }


    }
}
