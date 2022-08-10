using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapp.API.ApiExtensions;
using webapp.API.Data;
using webapp.API.Models;
using webapp.API.Services;

namespace webapp.API.Controllers;

[Route("api/[controller]/{username}")]
public class ProfileController : ApiController
{
    private readonly AppDbContext _ctx;
    private readonly CurrentUserService _currentUserService;

    public ProfileController(AppDbContext ctx, CurrentUserService currentUserService)
    {
        _ctx = ctx;
        _currentUserService = currentUserService;
    }

    [HttpGet,Route("")]
    public async Task<IActionResult> GetUser([FromRoute] string username)
    {
        var response = new ResultDto<Profile>();
        var profile = await _ctx.Users.Where(x=>x.UserName == username)
            .Select(x=>new
            {
                x.Id,
                Username = x.UserName,
                x.Bio,
                x.Image
            }).FirstOrDefaultAsync();
        if (profile != null)
        {
            var isFollowing = await _ctx.UserFollowers.AsNoTracking().AnyAsync(x => x.UserId == profile.Id && x.FollowerId == _currentUserService.UserId);
            response.Value = new Profile(profile.Username, profile.Bio, profile.Image, isFollowing);
            return Ok(response);
        }
        response.Errors = new List<ErrorDto> {new() {Message = $"User {username} not Found"}};
        return NotFound(response);
    }
    
    [HttpPost,Route("follow")]
    public async Task<IActionResult> FollowUser([FromRoute] string username)
    {
        var userToFollow = await _ctx.Users.FirstOrDefaultAsync(x => x.UserName == username);
        if (userToFollow == null) return NotFound();
        var userFollower = new UserFollower
        {
            UserId = userToFollow.Id,
            FollowerId = _currentUserService.UserId
        };
        await _ctx.UserFollowers.AddAsync(userFollower);
        await _ctx.SaveChangesAsync();
        return Ok();
    }
    
    
    [HttpDelete,Route("follow")]
    public async Task<IActionResult> UnfollowUser([FromRoute] string username)
    {
        var userToUnfollow = await _ctx.Users.FirstOrDefaultAsync(x => x.UserName == username);
        if (userToUnfollow == null) return BadRequest();
        {
            var followedUser = await _ctx.UserFollowers.FirstOrDefaultAsync(x =>
                x.FollowerId == _currentUserService.UserId && x.UserId == userToUnfollow.Id);
            if (followedUser == null) return BadRequest();
            _ctx.UserFollowers.Remove(followedUser);
            await _ctx.SaveChangesAsync();
            return Ok();
        }
    }
}

public record Profile(string Username, string? Bio, string? Image, bool Following);
