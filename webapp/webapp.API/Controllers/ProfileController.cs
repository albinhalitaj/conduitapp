using Microsoft.AspNetCore.Mvc;
using webapp.API.Interfaces;

namespace webapp.API.Controllers;

[Route("api/[controller]/{username}")]
public class ProfileController : ApiController
{
    private readonly IProfileService _profileService;
    public ProfileController(IProfileService profileService) => _profileService = profileService;

    [HttpGet,Route("")]
    public async Task<IActionResult> GetUser([FromRoute] string username)
    {
        var response = await _profileService.GetUser(username);
        return response.Success ? Ok(response) : BadRequest(response);
    }
    
    [HttpPost,Route("follow")]
    public async Task<IActionResult> FollowUser([FromRoute] string username)
    {
        var response = await _profileService.FollowUser(username);
        return response.Success ? Ok(response) : BadRequest(response);
    }
    
    [HttpDelete,Route("follow")]
    public async Task<IActionResult> UnfollowUser([FromRoute] string username)
    {
        var response = await _profileService.UnFollowUser(username);
        return response.Success ? Ok(response) : BadRequest(response);
    }
}