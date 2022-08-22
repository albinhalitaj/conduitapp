using Microsoft.AspNetCore.Mvc;
using webapp.Application.Interfaces;

namespace webapp.API.Controllers.V1;

[Route("api/v{version:apiVersion}/[controller]/{username}")]
public class ProfilesController : ApiController
{
    private readonly IProfileService _profileService;
    public ProfilesController(IProfileService profileService) => _profileService = profileService;

    [HttpGet("")]
    public async Task<IActionResult> GetUser(string username)
    {
        var response = await _profileService.GetUser(username);
        return response.Success
            ? Ok(new
            {
                Profile = response.Value
            })
            : Problem(response.Errors);
    }

    [HttpPost("follow")]
    public async Task<IActionResult> FollowUser(string username)
    {
        var response = await _profileService.FollowUser(username);
        return response.Success
            ? Ok(new
            {
                Profile = response.Value
            })
            : Problem(response.Errors);
    }

    [HttpDelete("follow")]
    public async Task<IActionResult> UnfollowUser(string username)
    {
        var response = await _profileService.UnFollowUser(username);
        return response.Success
            ? Ok(new
            {
                Profile = response.Value
            })
            : Problem(response.Errors);
    }
}