using Azure.Core;
using CarParking.Data;
using CarParking.DTOs;
using CarParking.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CarParking.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public PaymentController(ApplicationDbContext _dbContext)
        {
            dbContext = _dbContext;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPaymentById(int id)
        {
            var payment = await dbContext.Payments.FindAsync(id);
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

            var vehicle = await dbContext.Vehicles
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

            if (vehicle.IsPaid == true)
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
                PaymentTime = DateTime.Now,
                PaymentMethod = paymentMethod,
            };

            vehicle.IsPaid = true;
            await dbContext.Payments.AddAsync(payment);
            await dbContext.SaveChangesAsync();

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
    }
}