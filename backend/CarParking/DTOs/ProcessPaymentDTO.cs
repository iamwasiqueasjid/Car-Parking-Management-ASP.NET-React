using CarParking.Models;

namespace CarParking.DTOs
{
    public class ProcessPaymentDTO
    {
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; }
    }
}
