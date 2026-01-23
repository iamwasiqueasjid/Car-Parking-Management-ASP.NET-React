using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace CarParking.Models
{
    public class ApplicationUser : IdentityUser
    {
        [Required]
        public string FullName { get; set; }

        [Required]
        public UserRole Role { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Vehicle> Vehicles { get; set; }
    }

    public enum UserRole
    {
        Customer = 0,
        Owner = 1
    }
}