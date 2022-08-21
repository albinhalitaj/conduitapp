using webapp.Contracts.Common;
using webapp.Contracts.Users;

namespace webapp.Application.Interfaces;

public interface IIdentityService
{
    Task<ResultDto<RegisterResponse>> RegisterAsync(RegisterRequest request);
    Task<ResultDto<User>> LoginAsync(LoginRequest request);
    Task<bool> EmailExists(string email);
    Task<bool> UsernameExists(string username);
    Task<ResultDto<UserResponse>> UpdateUser(UpdateUserRequest user);
    Task<ResultDto<UserResponse>> GetUser(string userId);
}