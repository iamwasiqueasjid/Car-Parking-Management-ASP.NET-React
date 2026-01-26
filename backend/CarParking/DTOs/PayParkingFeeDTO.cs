using System.ComponentModel.DataAnnotations;

namespace CarParking.DTOs
{
    public class PayParkingFeeDTO
    {
        [Required]
        public int VehicleId { get; set; }
    }
}
