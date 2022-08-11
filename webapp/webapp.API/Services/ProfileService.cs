using Microsoft.EntityFrameworkCore;
using webapp.API.ApiExtensions;
using webapp.API.Controllers;
using webapp.API.Data;
using webapp.API.Interfaces;
using webapp.API.Models;

namespace webapp.API.Services;

public class ProfileService : IProfileService
{
    private readonly AppDbContext _ctx;
    private readonly CurrentUserService _currentUserService;

    public ProfileService(AppDbContext ctx,CurrentUserService currentUserService)
    {
        _ctx = ctx;
        _currentUserService = currentUserService;
    }

    public async Task<ResultDto<Profile>> GetUser(string username)
    {
        var response = new ResultDto<Profile>();
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
            response.Value = new Profile(profile.Username, profile.Bio, profile.Image, isFollowing);
            return response;
        }
        response.Errors = new List<ErrorDto> {new() {Message = $"User {username} not Found"}};
        return response;
    }

    public async Task<ResultDto<Profile>> FollowUser(string username)
    {
        var response = new ResultDto<Profile>();
        var userToFollow = await _ctx.Users.FirstOrDefaultAsync(x => x.UserName == username);
        if (userToFollow is null)
        {
            response.Errors = new List<ErrorDto>
                {new() {Message = $"No user found with username {username}"}};
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
        response.Value = new Profile(userToFollow.UserName, userToFollow.Bio, userToFollow.Image, true);
        return response;
    }

    public async Task<ResultDto<Profile>> UnFollowUser(string username)
    {
        var response = new ResultDto<Profile>();
        var userToUnfollow = await _ctx.Users.Where(x => x.UserName == username)
            .Select(x => new
            {
                x.Id
            }).FirstOrDefaultAsync();
        if (userToUnfollow is null)
        {
            response.Errors = new List<ErrorDto> {new() {Message = $"Profile not found with username {username}"}};
            return response;
        }
        
        var followedUser = await _ctx.UserFollowers.Where(x =>
                x.FollowerId == _currentUserService.UserId && x.UserId == userToUnfollow.Id)
            .Select(x=> new
            {
                Profile = new Profile(x.User!.UserName,x.User.Bio,x.User.Image,false),
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

public record Profile(string Username, string? Bio, string? Image, bool Following);
