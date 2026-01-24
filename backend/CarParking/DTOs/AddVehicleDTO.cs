using System.ComponentModel.DataAnnotations;

namespace CarParking.DTOs
{
    public class AddVehicleDTO
    {
        [Required]
        public required string VRM { get; set; }

        public string? Zone { get; set; }
    }
}