using System.ComponentModel.DataAnnotations;

namespace CarParking.Models
{
    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }

        public int VehicleId { get; set; }

        public Vehicle? Vehicle { get; set; }

        public decimal Amount { get; set; }

        public DateTime PaymentTime { get; set; }

        public required string PaymentMethod { get; set; }

        /// <summary>
        /// Payment Type: "OnSpot" for walk-in customers, "UserAccount" for registered users
        /// </summary>
        public string PaymentType { get; set; } = "OnSpot";
    }
}