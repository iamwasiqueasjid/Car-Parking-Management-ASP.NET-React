using System.ComponentModel.DataAnnotations;
using CarParking.Models;

namespace CarParking.DTOs.Auth
{
    public class RegisterDto
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public required string Password { get; set; }

        [Required]
        public required string FullName { get; set; }

        [Required]
        [Phone]
        public required string PhoneNumber { get; set; }

        [Required]
        public UserRole Role { get; set; }
    }
}