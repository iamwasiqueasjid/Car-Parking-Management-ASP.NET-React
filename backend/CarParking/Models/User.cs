using System.ComponentModel.DataAnnotations;

namespace CarParking.Models
{
    public class User
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        public required string PasswordHash { get; set; }

        [Required]
        public required string FullName { get; set; }

        [Required]
        [Phone]
        public required string PhoneNumber { get; set; }

        [Required]
        public UserRole Role { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // Registered VRMs for this customer (comma-separated or collection)
        public string? RegisteredVRMs { get; set; }

        // Account Balance
        public decimal CreditBalance { get; set; } = 0;

        public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    }

    public enum UserRole
    {
        Customer = 0,
        Owner = 1
    }
}