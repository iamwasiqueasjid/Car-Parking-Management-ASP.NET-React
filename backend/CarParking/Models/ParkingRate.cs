using System.ComponentModel.DataAnnotations;

namespace CarParking.Models
{
    public class ParkingRate
    {
        [Key]
        public int RateId { get; set; }

        public decimal HourlyRate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
    }
}