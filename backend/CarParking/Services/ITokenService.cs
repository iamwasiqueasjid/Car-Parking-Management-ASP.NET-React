using CarParking.Models;

namespace CarParking.Services
{
    public interface ITokenService
    {
        string GenerateToken(ApplicationUser user);
    }
}