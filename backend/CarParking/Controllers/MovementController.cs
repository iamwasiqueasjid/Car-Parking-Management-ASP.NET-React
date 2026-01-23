using CarParking.Data;
using CarParking.DTOs;
using CarParking.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarParking.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MovementController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public MovementController(ApplicationDbContext _dbContext)
        {
            dbContext = _dbContext;
        }



        [HttpPost("record-entry")]
        public async Task<IActionResult> RecordEntry (AddVehicleDTO addVehicleDTO)
        {
            var vehicle = new Vehicle()
            {
                VRM = addVehicleDTO.VRM.Replace(" ", "").ToLower(),
                EntryTime = DateTime.Now,
            };
            await dbContext.Vehicles.AddAsync(vehicle);
            await dbContext.SaveChangesAsync();
            return Ok(vehicle);
        }

        [HttpPost("record-exit/{vrm}")]
        public async Task<IActionResult> RecordExit(string vrm)
        {
            vrm = vrm.Replace(" ", "").ToLower();
            var vehicle = await dbContext.Vehicles.FirstOrDefaultAsync(v => v.VRM == vrm && v.ExitTime == null);
            if (vehicle is null)
            {
                return NotFound("Vehicle not found or already exited.");
            }
            vehicle.ExitTime = DateTime.Now;

            var parkingRate = await dbContext.ParkingRates.FirstOrDefaultAsync();
            if (parkingRate != null)
            {
                var duration = (vehicle.ExitTime.Value - vehicle.EntryTime).TotalHours;
                vehicle.ParkingFee = (decimal)Math.Ceiling(duration) * parkingRate.HourlyRate;
            }

            await dbContext.SaveChangesAsync();
            return Ok();

        }


    }
}
