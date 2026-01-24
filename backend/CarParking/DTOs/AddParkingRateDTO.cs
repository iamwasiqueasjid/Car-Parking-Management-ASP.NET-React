using System.ComponentModel.DataAnnotations;

namespace CarParking.DTOs
{
    public class AddParkingRateDTO
    {
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Hourly rate must be greater than 0")]
        public decimal HourlyRate { get; set; }
    }
}
