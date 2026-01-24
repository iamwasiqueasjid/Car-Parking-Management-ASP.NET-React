using CarParking.Models;

namespace CarParking.DTOs.Auth
{
    public class AuthResponseDto
    {
        public required string Token { get; set; }
        public required UserDto User { get; set; }
    }

    public class UserDto
    {
        public int UserId { get; set; }
        public required string Email { get; set; }
        public required string FullName { get; set; }
        public required string PhoneNumber { get; set; }
        public UserRole Role { get; set; }
    }
}