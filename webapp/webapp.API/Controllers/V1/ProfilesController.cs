using Microsoft.AspNetCore.Mvc;
using webapp.API.Interfaces;

namespace webapp.API.Controllers.V1;

[Route("api/v{version:apiVersion}/[controller]/{username}")]
public class ProfilesController : ApiController
{
    private readonly IProfileService _profileService;
    public ProfilesController(IProfileService profileService) => _profileService = profileService;

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