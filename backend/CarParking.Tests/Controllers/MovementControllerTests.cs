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
    public class MovementControllerTests
    {
        private readonly DbContextOptions<ApplicationDbContext> _dbOptions;

        public MovementControllerTests()
        {
            _dbOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
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

        #region RecordEntry Tests

        [Fact]
        public async Task RecordEntry_CustomerRole_CreatesVehicleWithCustomerId()
        {
            // Arrange
            using var dbContext = CreateDbContext();
            var controller = new MovementController(dbContext)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext
                    {
                        User = CreateUserClaims(1, "Customer")
                    }
                }
            };

            var dto = new AddVehicleDTO
            {
                VRM = "ABC 123",
                Zone = "A"
            };

            // Act
            var result = await controller.RecordEntry(dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var vehicle = await dbContext.Vehicles.FirstOrDefaultAsync();
            Assert.NotNull(vehicle);
            Assert.Equal("abc123", vehicle.VRM);
            Assert.Equal(1, vehicle.UserId);
            Assert.Equal("A", vehicle.Zone);
        }

        #endregion

        #region RecordExit Tests

        [Fact]
        public async Task RecordExit_ValidVRM_RecordsExitAndCalculatesFee()
        {
            // Arrange
            using var dbContext = CreateDbContext();
            var rate = new ParkingRate
            {
                HourlyRate = 5.00m,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            dbContext.ParkingRates.Add(rate);

            var vehicle = new Vehicle
            {
                VRM = "abc123",
                EntryTime = DateTime.UtcNow.AddHours(-2),
                Zone = "A"
            };
            dbContext.Vehicles.Add(vehicle);
            await dbContext.SaveChangesAsync();

            var controller = new MovementController(dbContext);

            // Act
            var result = await controller.RecordExit("ABC 123");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var updatedVehicle = await dbContext.Vehicles.FirstOrDefaultAsync();
            Assert.NotNull(updatedVehicle);
            Assert.NotNull(updatedVehicle.ExitTime);
            Assert.True(updatedVehicle.ParkingFee > 0);
        }

        #endregion

        #region GetActiveVehicles Tests

        [Fact]
        public async Task GetActiveVehicles_OwnerRole_ReturnsOnlyOwnersActiveVehicles()
        {
            // Arrange
            using var dbContext = CreateDbContext();
            
            var vehicle1 = new Vehicle { VRM = "abc123", EntryTime = DateTime.UtcNow, OwnerId = 1 };
            var vehicle2 = new Vehicle { VRM = "xyz789", EntryTime = DateTime.UtcNow, OwnerId = 2 };
            var vehicle3 = new Vehicle { VRM = "def456", EntryTime = DateTime.UtcNow, ExitTime = DateTime.UtcNow, OwnerId = 1 };
            
            dbContext.Vehicles.AddRange(vehicle1, vehicle2, vehicle3);
            await dbContext.SaveChangesAsync();

            var controller = new MovementController(dbContext)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext
                    {
                        User = CreateUserClaims(1, "Owner")
                    }
                }
            };

            // Act
            var result = await controller.GetActiveVehicles();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var vehicles = okResult.Value as IEnumerable<object>;
            Assert.NotNull(vehicles);
            Assert.Single(vehicles);
        }

        #endregion
    }
}
