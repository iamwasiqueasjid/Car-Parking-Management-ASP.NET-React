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
        public string VRM { get; set; }
        public DateTime EntryTime { get; set; }
        public DateTime? ExitTime { get; set; }
        public decimal? ParkingFee { get; set; }
        public bool IsPaid { get; set; } = false;
        public ICollection<Payment> Payments { get; set; }
    }
}
