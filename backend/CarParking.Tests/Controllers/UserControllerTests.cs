using CarParking.Controllers;
using CarParking.Data;
using CarParking.DTOs.Auth;
using CarParking.Models;
using CarParking.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Security.Claims;

namespace CarParking.Tests.Controllers
{
    public class UserControllerTests
    {
        private readonly DbContextOptions<ApplicationDbContext> _dbOptions;
        private readonly Mock<IAuthService> _mockAuthService;

        public UserControllerTests()
        {
            _dbOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _mockAuthService = new Mock<IAuthService>();
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

        #region GetCurrentUser Tests

        [Fact]
        public async Task GetCurrentUser_ValidUser_ReturnsUserDto()
        {
            // Arrange
            using var dbContext = CreateDbContext();
            var user = new User
            {
                Email = "user@example.com",
                PasswordHash = "hashedPassword",
                FullName = "Test User",
                PhoneNumber = "1234567890",
                Role = UserRole.Customer
            };
            dbContext.Users.Add(user);
            await dbContext.SaveChangesAsync();

            var controller = new UserController(dbContext, _mockAuthService.Object)
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
            var result = await controller.GetCurrentUser();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var userDto = Assert.IsType<UserDto>(okResult.Value);
            Assert.Equal(user.Email, userDto.Email);
            Assert.Equal(user.FullName, userDto.FullName);
        }

        #endregion

        #region ChangePassword Tests

        [Fact]
        public async Task ChangePassword_ValidOldPassword_ChangesPassword()
        {
            // Arrange
            using var dbContext = CreateDbContext();
            var user = new User
            {
                Email = "user@example.com",
                PasswordHash = "oldHashedPassword",
                FullName = "Test User",
                PhoneNumber = "1234567890",
                Role = UserRole.Customer
            };
            dbContext.Users.Add(user);
            await dbContext.SaveChangesAsync();

            _mockAuthService.Setup(x => x.VerifyPassword("OldPassword123!", "oldHashedPassword"))
                .Returns(true);
            _mockAuthService.Setup(x => x.HashPassword("NewPassword123!"))
                .Returns("newHashedPassword");

            var controller = new UserController(dbContext, _mockAuthService.Object)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext
                    {
                        User = CreateUserClaims(user.UserId)
                    }
                }
            };

            var dto = new ChangePasswordDTO
            {
                OldPassword = "OldPassword123!",
                NewPassword = "NewPassword123!"
            };

            // Act
            var result = await controller.ChangePassword(dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var updatedUser = await dbContext.Users.FindAsync(user.UserId);
            Assert.NotNull(updatedUser);
            Assert.Equal("newHashedPassword", updatedUser.PasswordHash);
        }

        #endregion
    }
}
