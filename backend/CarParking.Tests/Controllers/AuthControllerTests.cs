using CarParking.Controllers;
using CarParking.Data;
using CarParking.DTOs.Auth;
using CarParking.Models;
using CarParking.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace CarParking.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly DbContextOptions<ApplicationDbContext> _dbOptions;
        private readonly Mock<IAuthService> _mockAuthService;

        public AuthControllerTests()
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

        #region Register Tests

        [Fact]
        public async Task Register_ValidData_ReturnsOkWithUserDto()
        {
            // Arrange
            using var dbContext = CreateDbContext();
            _mockAuthService.Setup(x => x.HashPassword(It.IsAny<string>()))
                .Returns("hashedPassword");
            _mockAuthService.Setup(x => x.GenerateToken(It.IsAny<User>()))
                .Returns("test.jwt.token");

            var controller = new AuthController(dbContext, _mockAuthService.Object)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext()
                }
            };

            var registerDto = new RegisterDto
            {
                Email = "test@example.com",
                Password = "Password123!",
                FullName = "Test User",
                PhoneNumber = "1234567890",
                Role = UserRole.Customer
            };

            // Act
            var result = await controller.Register(registerDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnValue = okResult.Value;
            Assert.NotNull(returnValue);
            
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == registerDto.Email);
            Assert.NotNull(user);
            Assert.Equal(registerDto.Email, user.Email);
            Assert.Equal(registerDto.FullName, user.FullName);
        }

        [Fact]
        public async Task Register_DuplicateEmail_ReturnsBadRequest()
        {
            // Arrange
            using var dbContext = CreateDbContext();
            var existingUser = new User
            {
                Email = "existing@example.com",
                PasswordHash = "hashedPassword",
                FullName = "Existing User",
                PhoneNumber = "1234567890",
                Role = UserRole.Customer
            };
            dbContext.Users.Add(existingUser);
            await dbContext.SaveChangesAsync();

            var controller = new AuthController(dbContext, _mockAuthService.Object);
            var registerDto = new RegisterDto
            {
                Email = "existing@example.com",
                Password = "Password123!",
                FullName = "New User",
                PhoneNumber = "0987654321",
                Role = UserRole.Customer
            };

            // Act
            var result = await controller.Register(registerDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult.Value);
        }

        #endregion

        #region Login Tests

        [Fact]
        public async Task Login_ValidCredentials_ReturnsOkWithToken()
        {
            // Arrange
            using var dbContext = CreateDbContext();
            var user = new User
            {
                Email = "user@example.com",
                PasswordHash = "hashedPassword",
                FullName = "Test User",
                PhoneNumber = "1234567890",
                Role = UserRole.Customer,
                IsActive = true
            };
            dbContext.Users.Add(user);
            await dbContext.SaveChangesAsync();

            _mockAuthService.Setup(x => x.VerifyPassword("Password123!", "hashedPassword"))
                .Returns(true);
            _mockAuthService.Setup(x => x.GenerateToken(It.IsAny<User>()))
                .Returns("test.jwt.token");

            var controller = new AuthController(dbContext, _mockAuthService.Object)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext()
                }
            };

            var loginDto = new LoginDto
            {
                Email = "user@example.com",
                Password = "Password123!"
            };

            // Act
            var result = await controller.Login(loginDto);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task Login_InvalidEmail_ReturnsUnauthorized()
        {
            // Arrange
            using var dbContext = CreateDbContext();
            var controller = new AuthController(dbContext, _mockAuthService.Object);
            
            var loginDto = new LoginDto
            {
                Email = "nonexistent@example.com",
                Password = "Password123!"
            };

            // Act
            var result = await controller.Login(loginDto);

            // Assert
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task Login_InvalidPassword_ReturnsUnauthorized()
        {
            // Arrange
            using var dbContext = CreateDbContext();
            var user = new User
            {
                Email = "user@example.com",
                PasswordHash = "hashedPassword",
                FullName = "Test User",
                PhoneNumber = "1234567890",
                Role = UserRole.Customer,
                IsActive = true
            };
            dbContext.Users.Add(user);
            await dbContext.SaveChangesAsync();

            _mockAuthService.Setup(x => x.VerifyPassword("WrongPassword!", "hashedPassword"))
                .Returns(false);

            var controller = new AuthController(dbContext, _mockAuthService.Object);
            var loginDto = new LoginDto
            {
                Email = "user@example.com",
                Password = "WrongPassword!"
            };

            // Act
            var result = await controller.Login(loginDto);

            // Assert
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task Login_InactiveUser_ReturnsUnauthorized()
        {
            // Arrange
            using var dbContext = CreateDbContext();
            var user = new User
            {
                Email = "inactive@example.com",
                PasswordHash = "hashedPassword",
                FullName = "Inactive User",
                PhoneNumber = "1234567890",
                Role = UserRole.Customer,
                IsActive = false
            };
            dbContext.Users.Add(user);
            await dbContext.SaveChangesAsync();

            _mockAuthService.Setup(x => x.VerifyPassword(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(true);

            var controller = new AuthController(dbContext, _mockAuthService.Object);
            var loginDto = new LoginDto
            {
                Email = "inactive@example.com",
                Password = "Password123!"
            };

            // Act
            var result = await controller.Login(loginDto);

            // Assert
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        #endregion


    }
}
