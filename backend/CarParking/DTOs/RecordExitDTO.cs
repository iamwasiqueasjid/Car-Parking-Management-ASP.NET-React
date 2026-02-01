using System.ComponentModel.DataAnnotations;

namespace CarParking.DTOs
{
    public class RecordExitDTO
    {
        /// <summary>
        /// Payment type: "OnSpot" for walk-in customers (cash/card), "UserAccount" for registered users
        /// </summary>
        [Required]
        public required string PaymentType { get; set; }

        /// <summary>
        /// Payment method: "Cash" or "Card" (required only for OnSpot payments)
        /// </summary>
        public string? PaymentMethod { get; set; }
    }
}
