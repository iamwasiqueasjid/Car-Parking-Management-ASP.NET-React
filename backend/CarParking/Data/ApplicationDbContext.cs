using CarParking.Models;
using Microsoft.EntityFrameworkCore;

namespace CarParking.Data
{
    public class ApplicationDbContext: DbContext
    {
        public ApplicationDbContext(DbContextOptions options): base(options)
        {
            
        }

        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<ParkingRate> ParkingRates { get; set; }


    }
}
