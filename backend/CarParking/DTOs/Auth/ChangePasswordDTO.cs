using System.ComponentModel.DataAnnotations;

namespace CarParking.DTOs.Auth
{
    public class ChangePasswordDTO
    {
        [Required]
        public required string OldPassword { get; set; }

        [Required]
        [MinLength(6)]
        public required string NewPassword { get; set; }
    }
}
