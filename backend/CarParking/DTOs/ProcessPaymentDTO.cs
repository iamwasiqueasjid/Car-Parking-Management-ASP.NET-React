using System.ComponentModel.DataAnnotations;

namespace CarParking.DTOs
{
    public class ProcessPaymentDTO
    {
        [Required]
        public decimal Amount { get; set; }

        [Required]
        public string PaymentMethod { get; set; }
    }
}