using Microsoft.EntityFrameworkCore;
using webapp.Application.Interfaces;
using webapp.Contracts.Common;
using webapp.Contracts.Profiles;
using webapp.Domain.Entities;

namespace webapp.Application.Services;

public class ProfileService : IProfileService
{
    private readonly IAppDbContext _ctx;
    private readonly ICurrentUserService _currentUserService;

    public ProfileService(IAppDbContext ctx,ICurrentUserService currentUserService)
    {
        _ctx = ctx;
        _currentUserService = currentUserService;
    }

    public async Task<ResultDto<ProfileResponse>> GetUser(string username)
    {
        var response = new ResultDto<ProfileResponse>();
        var profile = await _ctx.Users
            .Where(x=>x.UserName == username)
            .Select(x=> new
            {
                x.Id,
                Username = x.UserName,
                x.Bio,
                x.Image
            }).FirstOrDefaultAsync();
        if (profile is not null)
        {
            var isFollowing = await _ctx.UserFollowers.AsNoTracking().AnyAsync(x => x.UserId == profile.Id && x.FollowerId == _currentUserService.UserId);
            response.Value = new ProfileResponse(profile.Username, profile.Bio, profile.Image, isFollowing);
            return response;
        }
        response.Errors = new List<ErrorDto> {new() {Message = $"User {username} not Found", ErrorCode = "NotFound"}};
        return response;
    }

    public async Task<ResultDto<ProfileResponse>> FollowUser(string username)
    {
        var response = new ResultDto<ProfileResponse>();
        var userToFollow = await _ctx.Users.FirstOrDefaultAsync(x => x.UserName == username);
        if (userToFollow is null)
        {
            response.Errors = new List<ErrorDto>
                {new() {Message = $"No user found with username {username}", ErrorCode = "NotFound"}};
            return response;
        }

        var isFollowing = await _ctx.UserFollowers.AnyAsync(x =>
            x.FollowerId == _currentUserService.UserId && x.UserId == userToFollow.Id);

        if (isFollowing)
        {
            response.Errors = new List<ErrorDto> {new() {Message = $"You are already following {username}"}};
            return response;
        }

        var userFollower = new UserFollower
        {
            UserId = userToFollow.Id,
            FollowerId = _currentUserService.UserId
        };
        await _ctx.UserFollowers.AddAsync(userFollower);
        await _ctx.SaveChangesAsync();
        response.Value = new ProfileResponse(userToFollow.UserName, userToFollow.Bio, userToFollow.Image, true);
        return response;
    }

    public async Task<ResultDto<ProfileResponse>> UnFollowUser(string username)
    {
        var response = new ResultDto<ProfileResponse>();
        var userToUnfollow = await _ctx.Users.Where(x => x.UserName == username)
            .Select(x => new
            {
                x.Id
            }).FirstOrDefaultAsync();
        if (userToUnfollow is null)
        {
            response.Errors = new List<ErrorDto> {new() {Message = $"Profile not found with username {username}", ErrorCode = "NotFound"}};
            return response;
        }

        var followedUser = await _ctx.UserFollowers.Where(x =>
                x.FollowerId == _currentUserService.UserId && x.UserId == userToUnfollow.Id)
            .Select(x=> new
            {
                Profile = new ProfileResponse(x.User!.UserName,x.User.Bio,x.User.Image,false),
                Id = x.UserFollowerId
            }).FirstOrDefaultAsync();
        if (followedUser is null)
        {
            response.Errors = new List<ErrorDto> {new() {Message = $"You are not following {username}"}};
            return response;
        }
        var userFollowerToDelete = new UserFollower {UserFollowerId = followedUser.Id};
        _ctx.UserFollowers.Remove(userFollowerToDelete);
        await _ctx.SaveChangesAsync();
        response.Value = followedUser.Profile;
        return response;
    }
}
