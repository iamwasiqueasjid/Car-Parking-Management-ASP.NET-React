using CarParking.Controllers;
using CarParking.Data;
using CarParking.DTOs;
using CarParking.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using static CarParking.Controllers.CustomerController;

namespace CarParking.Tests.Controllers
{
    public class CustomerControllerTests
    {
        private readonly DbContextOptions<ApplicationDbContext> _dbOptions;

        public CustomerControllerTests()
        {
            _dbOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        private ApplicationDbContext CreateDbContext()
        {
            return new ApplicationDbContext(_dbOptions);
        }

        private ClaimsPrincipal CreateUserClaims(int userId)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            };
            return new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
        }



        #region VRM Management Tests

        [Fact]
        public async Task AddVRM_ValidVRM_AddsToRegisteredVRMs()
        {
            // Arrange
            using var dbContext = CreateDbContext();
            var user = new User
            {
                Email = "customer@example.com",
                PasswordHash = "hash",
                FullName = "Customer",
                PhoneNumber = "1234567890",
                Role = UserRole.Customer
            };
            dbContext.Users.Add(user);
            await dbContext.SaveChangesAsync();

            var controller = new CustomerController(dbContext)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext
                    {
                        User = CreateUserClaims(user.UserId)
                    }
                }
            };

            // Act
            var result = await controller.AddVRM(new AddVRMRequest { VRM = "ABC 123" });

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var updatedUser = await dbContext.Users.FindAsync(user.UserId);
            Assert.NotNull(updatedUser);
            Assert.Contains("abc123", updatedUser!.RegisteredVRMs);
        }

        #endregion

        #region Credit Management Tests

        [Fact]
        public async Task AddCredit_ValidAmount_IncreasesBalance()
        {
            // Arrange
            using var dbContext = CreateDbContext();
            var user = new User
            {
                Email = "customer@example.com",
                PasswordHash = "hash",
                FullName = "Customer",
                PhoneNumber = "1234567890",
                Role = UserRole.Customer,
                CreditBalance = 50.00m
            };
            dbContext.Users.Add(user);
            await dbContext.SaveChangesAsync();

            var controller = new CustomerController(dbContext)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext
                    {
                        User = CreateUserClaims(user.UserId)
                    }
                }
            };

            var dto = new AddCreditDTO 
            { 
                Amount = 25.00m,
                BankAccountNumber = "1234567890",
                CardNumber = "4111111111111111"
            };

            // Act
            var result = await controller.AddCredit(dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var updatedUser = await dbContext.Users.FindAsync(user.UserId);
            Assert.NotNull(updatedUser);
            Assert.Equal(75.00m, updatedUser.CreditBalance);
        }

        [Fact]
        public async Task PayParkingFee_SufficientCredit_ProcessesPayment()
        {
            // Arrange
            using var dbContext = CreateDbContext();
            var user = new User
            {
                Email = "customer@example.com",
                PasswordHash = "hash",
                FullName = "Customer",
                PhoneNumber = "1234567890",
                Role = UserRole.Customer,
                CreditBalance = 50.00m
            };
            dbContext.Users.Add(user);
            
            var vehicle = new Vehicle
            {
                VRM = "abc123",
                EntryTime = DateTime.UtcNow.AddHours(-2),
                ExitTime = DateTime.UtcNow,
                ParkingFee = 20.00m,
                IsPaid = false,
                UserId = user.UserId
            };
            dbContext.Vehicles.Add(vehicle);
            await dbContext.SaveChangesAsync();

            var controller = new CustomerController(dbContext)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext
                    {
                        User = CreateUserClaims(user.UserId)
                    }
                }
            };

            var dto = new PayParkingFeeDTO { VehicleId = vehicle.VehicleId };

            // Act
            var result = await controller.PayParkingFee(dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var updatedUser = await dbContext.Users.FindAsync(user.UserId);
            var updatedVehicle = await dbContext.Vehicles.FindAsync(vehicle.VehicleId);
            
            Assert.NotNull(updatedUser);
            Assert.NotNull(updatedVehicle);
            Assert.Equal(30.00m, updatedUser.CreditBalance);
            Assert.True(updatedVehicle.IsPaid);
        }

        #endregion
    }
}
