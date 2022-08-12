using webapp.API.ApiExtensions;
using webapp.API.Controllers;
using webapp.API.DTOs;
using webapp.API.Services;

namespace webapp.API.Interfaces;

public interface IIdentityService
{
    Task<ResultDto<RegisterResponse>> RegisterAsync(RegisterRequest request);
    Task<ResultDto<User>> LoginAsync(LoginRequest request);
    Task<bool> EmailExists(string email);
    Task<bool> UsernameExists(string username);
}