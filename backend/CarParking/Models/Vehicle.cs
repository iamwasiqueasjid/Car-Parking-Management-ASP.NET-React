using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarParking.Models
{
    public class Vehicle
    {
        [Key]
        public int VehicleId { get; set; }

        [Column(TypeName = "varchar(20)")]
        [Required(ErrorMessage = "VRM is required")]
        public required string VRM { get; set; }

        public DateTime EntryTime { get; set; }

        public DateTime? ExitTime { get; set; }

        public decimal? ParkingFee { get; set; }

        public bool IsPaid { get; set; } = false;

        public int? UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        // Owner of the parking lot where vehicle entered
        public int? OwnerId { get; set; }

        public string? Zone { get; set; }

        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}