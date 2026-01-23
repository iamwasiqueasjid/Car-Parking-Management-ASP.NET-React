using System.ComponentModel.DataAnnotations;

namespace CarParking.DTOs
{
    public class AddVehicleDTO
    {
        [Required]
        public string VRM { get; set; }

        public string? Zone { get; set; }
    }
}