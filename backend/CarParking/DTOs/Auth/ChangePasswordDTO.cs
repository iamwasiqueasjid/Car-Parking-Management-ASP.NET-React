using System.ComponentModel.DataAnnotations;

namespace CarParking.DTOs.Auth
{
    public class ChangePasswordDTO
    {
        [Required]
        public string OldPassword { get; set; }

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; }
    }
}
