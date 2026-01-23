using System.ComponentModel.DataAnnotations;

namespace CarParking.Models
{
    public class ParkingRate
    {
        [Key]
        public int RateId { get; set; }
        public decimal HourlyRate { get; set; }
    }
}
