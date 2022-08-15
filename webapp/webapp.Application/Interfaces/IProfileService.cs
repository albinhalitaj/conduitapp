using webapp.Contracts.Common;
using webapp.Contracts.Profiles;

namespace webapp.Application.Interfaces;

public interface IProfileService
{
    Task<ResultDto<ProfileResponse>> GetUser(string username);
    Task<ResultDto<ProfileResponse>> FollowUser(string username);
    Task<ResultDto<ProfileResponse>> UnFollowUser(string username);
}