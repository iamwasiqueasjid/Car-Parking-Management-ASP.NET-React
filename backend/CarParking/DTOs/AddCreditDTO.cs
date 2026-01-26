using System.ComponentModel.DataAnnotations;

namespace CarParking.DTOs
{
    public class AddCreditDTO
    {
        [Required]
        [Range(1, 10000, ErrorMessage = "Amount must be between $1 and $10,000")]
        public decimal Amount { get; set; }

        [Required]
        public required string BankAccountNumber { get; set; }

        [Required]
        public required string CardNumber { get; set; }
    }
}
