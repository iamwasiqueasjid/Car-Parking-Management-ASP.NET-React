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
    public class ParkingRateControllerTests
    {
        private readonly DbContextOptions<ApplicationDbContext> _dbOptions;

        public ParkingRateControllerTests()
        {
            _dbOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(x => x.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
                .Options;
        }

        private ApplicationDbContext CreateDbContext()
        {
            return new ApplicationDbContext(_dbOptions);
        }

        private ClaimsPrincipal CreateUserClaims(int userId, string role)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim("Role", role)
            };
            return new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));
        }

        #region GetCurrentRate Tests

        [Fact]
        public async Task GetCurrentRate_ActiveRateExists_ReturnsCurrentRate()
        {
            // Arrange
            using var dbContext = CreateDbContext();
            var inactiveRate = new ParkingRate { HourlyRate = 5.00m, IsActive = false };
            var activeRate = new ParkingRate { HourlyRate = 7.00m, IsActive = true };
            
            dbContext.ParkingRates.AddRange(inactiveRate, activeRate);
            await dbContext.SaveChangesAsync();

            var controller = new ParkingRateController(dbContext);

            // Act
            var result = await controller.GetCurrentRate();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var rate = Assert.IsType<ParkingRate>(okResult.Value);
            Assert.Equal(7.00m, rate.HourlyRate);
            Assert.True(rate.IsActive);
        }

        #endregion

        #region AddRate Tests

        [Fact]
        public async Task AddRate_OwnerRole_DeactivatesOldRatesAndCreatesNewRate()
        {
            // Arrange
            using var dbContext = CreateDbContext();
            var oldRate = new ParkingRate { HourlyRate = 5.00m, IsActive = true };
            dbContext.ParkingRates.Add(oldRate);
            await dbContext.SaveChangesAsync();

            var controller = new ParkingRateController(dbContext)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext
                    {
                        User = CreateUserClaims(1, "Owner")
                    }
                }
            };

            var dto = new AddParkingRateDTO { HourlyRate = 8.00m };

            // Act
            var result = await controller.AddRate(dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            
            var rates = await dbContext.ParkingRates.ToListAsync();
            Assert.Equal(2, rates.Count);
            var activeRate = Assert.Single(rates, r => r.IsActive);
            Assert.Equal(8.00m, activeRate.HourlyRate);
            Assert.False(oldRate.IsActive);
        }

        #endregion
    }
}