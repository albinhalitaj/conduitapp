using webapp.API.Controllers;
using webapp.API.Services;

namespace webapp.API.Interfaces;

public interface IIdentityService
{
    Task<RegisterResult> RegisterAsync(RegisterRequest request);
    Task<LoginResult> LoginAsync(LoginRequest request);
    Task<bool> EmailExists(string email);
    Task<bool> UsernameExists(string username);
}