using CarParking.Models;

namespace CarParking.Services
{
    public interface IAuthService
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string passwordHash);
        string GenerateToken(User user);
    }
}