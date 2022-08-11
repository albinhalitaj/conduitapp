using webapp.API.ApiExtensions;
using webapp.API.Services;

namespace webapp.API.Interfaces;

public interface IProfileService
{
    Task<ResultDto<Profile>> GetUser(string username);
    Task<ResultDto<Profile>> FollowUser(string username);
    Task<ResultDto<Profile>> UnFollowUser(string username);
}