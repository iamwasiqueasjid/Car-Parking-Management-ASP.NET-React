using CarParking.Models;
using CarParking.Services;
using Microsoft.Extensions.Configuration;
using Moq;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace CarParking.Tests.Services
{
    public class AuthServiceTests
    {
        private readonly Mock<IConfiguration> _mockConfiguration;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            // Arrange - Setup mock configuration
            _mockConfiguration = new Mock<IConfiguration>();
            
            // Mock JWT configuration values
            var jwtKey = "ThisIsAVerySecureSecretKeyForJwtTokenGenerationThatIsLongEnough123456";
            var jwtIssuer = "CarParkingTestIssuer";
            var jwtAudience = "CarParkingTestAudience";
            var jwtExpiry = "60";

            _mockConfiguration.Setup(x => x["Jwt:Key"]).Returns(jwtKey);
            _mockConfiguration.Setup(x => x["Jwt:Issuer"]).Returns(jwtIssuer);
            _mockConfiguration.Setup(x => x["Jwt:Audience"]).Returns(jwtAudience);
            _mockConfiguration.Setup(x => x["Jwt:ExpiryInMinutes"]).Returns(jwtExpiry);

            _authService = new AuthService(_mockConfiguration.Object);
        }

        #region HashPassword Tests

        [Fact]
        public void HashPassword_ValidPassword_ReturnsHashedPassword()
        {
            // Arrange
            var password = "TestPassword123!";

            // Act
            var hashedPassword = _authService.HashPassword(password);

            // Assert
            Assert.NotNull(hashedPassword);
            Assert.NotEmpty(hashedPassword);
            Assert.NotEqual(password, hashedPassword);
            Assert.StartsWith("$2", hashedPassword);
        }

        [Fact]
        public void HashPassword_SamePasswordHashedTwice_ReturnsDifferentHashes()
        {
            // Arrange
            var password = "TestPassword123!";

            // Act
            var hash1 = _authService.HashPassword(password);
            var hash2 = _authService.HashPassword(password);

            // Assert
            Assert.NotEqual(hash1, hash2); // BCrypt generates different salts
        }

        #endregion

        #region VerifyPassword Tests

        [Fact]
        public void VerifyPassword_CorrectPassword_ReturnsTrue()
        {
            // Arrange
            var password = "TestPassword123!";
            var hashedPassword = _authService.HashPassword(password);

            // Act
            var result = _authService.VerifyPassword(password, hashedPassword);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void VerifyPassword_IncorrectPassword_ReturnsFalse()
        {
            // Arrange
            var password = "TestPassword123!";
            var wrongPassword = "WrongPassword456!";
            var hashedPassword = _authService.HashPassword(password);

            // Act
            var result = _authService.VerifyPassword(wrongPassword, hashedPassword);

            // Assert
            Assert.False(result);
        }

        #endregion

        #region GenerateToken Tests

        [Fact]
        public void GenerateToken_ValidUser_TokenContainsCorrectClaims()
        {
            // Arrange
            var user = new User
            {
                UserId = 42,
                Email = "user@test.com",
                FullName = "John Doe",
                Role = UserRole.Owner,
                PasswordHash = "hashedPassword",
                PhoneNumber = "9876543210"
            };

            // Act
            var token = _authService.GenerateToken(user);

            // Assert
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);

            Assert.Equal("42", jwtToken.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value);
            Assert.Equal("user@test.com", jwtToken.Claims.First(c => c.Type == ClaimTypes.Email).Value);
            Assert.Equal("Owner", jwtToken.Claims.First(c => c.Type == ClaimTypes.Role).Value);
        }

        #endregion

        #region Integration Tests

        [Fact]
        public void AuthService_FullAuthenticationFlow_WorksCorrectly()
        {
            // Arrange
            var password = "UserPassword123!";
            var user = new User
            {
                UserId = 100,
                Email = "fullflow@example.com",
                FullName = "Full Flow User",
                Role = UserRole.Customer,
                PasswordHash = _authService.HashPassword(password),
                PhoneNumber = "5555555555"
            };

            // Act - Simulate login: verify password and generate token
            var passwordVerified = _authService.VerifyPassword(password, user.PasswordHash);
            var token = _authService.GenerateToken(user);

            // Assert
            Assert.True(passwordVerified);
            Assert.NotNull(token);

            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);
            Assert.Equal(user.UserId.ToString(), jwtToken.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value);
        }

        #endregion
    }
}
