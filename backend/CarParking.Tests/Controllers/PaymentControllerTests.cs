using CarParking.Controllers;
using CarParking.Data;
using CarParking.DTOs;
using CarParking.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CarParking.Tests.Controllers
{
    public class PaymentControllerTests
    {
        private readonly DbContextOptions<ApplicationDbContext> _dbOptions;

        public PaymentControllerTests()
        {
            _dbOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        private ApplicationDbContext CreateDbContext()
        {
            return new ApplicationDbContext(_dbOptions);
        }

        #region ProcessPayment Tests

        [Fact]
        public async Task ProcessPayment_ValidPayment_MarksVehicleAsPaid()
        {
            // Arrange
            using var dbContext = CreateDbContext();
            var vehicle = new Vehicle
            {
                VRM = "abc123",
                EntryTime = DateTime.UtcNow.AddHours(-2),
                ExitTime = DateTime.UtcNow,
                ParkingFee = 10.00m,
                IsPaid = false
            };
            dbContext.Vehicles.Add(vehicle);
            await dbContext.SaveChangesAsync();

            var controller = new PaymentController(dbContext);
            var paymentDto = new ProcessPaymentDTO
            {
                Amount = 10.00m,
                PaymentMethod = "cash"
            };

            // Act
            var result = await controller.ProcessPayment("ABC 123", paymentDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var updatedVehicle = await dbContext.Vehicles.FirstOrDefaultAsync();
            Assert.NotNull(updatedVehicle);
            Assert.True(updatedVehicle.IsPaid);
            
            var payment = await dbContext.Payments.FirstOrDefaultAsync();
            Assert.NotNull(payment);
            Assert.Equal(10.00m, payment.Amount);
            Assert.Equal("cash", payment.PaymentMethod);
        }

        [Fact]
        public async Task ProcessPayment_InvalidPaymentMethod_ReturnsBadRequest()
        {
            // Arrange
            using var dbContext = CreateDbContext();
            var vehicle = new Vehicle
            {
                VRM = "abc123",
                EntryTime = DateTime.UtcNow.AddHours(-2),
                ExitTime = DateTime.UtcNow,
                ParkingFee = 10.00m,
                IsPaid = false
            };
            dbContext.Vehicles.Add(vehicle);
            await dbContext.SaveChangesAsync();

            var controller = new PaymentController(dbContext);
            var paymentDto = new ProcessPaymentDTO
            {
                Amount = 10.00m,
                PaymentMethod = "bitcoin" // Invalid payment method
            };

            // Act
            var result = await controller.ProcessPayment("ABC 123", paymentDto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        #endregion
    }
}
