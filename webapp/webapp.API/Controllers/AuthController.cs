using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using webapp.API.ApiExtensions;
using webapp.API.Interfaces;
using webapp.API.Services;

namespace webapp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IIdentityService _identityService;

    public AuthController(IIdentityService identityService) => _identityService = identityService;

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _identityService.RegisterAsync(request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [Route(nameof(Login)),AllowAnonymous,HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _identityService.LoginAsync(request);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost,Route(nameof(EmailExists))]
    public async Task<IActionResult> EmailExists([FromBody] EmailExistsRequest req)
    {
        if (req.Email == null) return BadRequest();
        var result = await _identityService.EmailExists(req.Email);
        return Ok(new ResultDto<bool>
        {
            Value = result
        });

    }
    [HttpPost,Route(nameof(UsernameExists))]
    public async Task<IActionResult> UsernameExists([FromBody] UsernameExistsRequest req)
    {
        if (req.Username == null) return BadRequest();
        var result = await _identityService.UsernameExists(req.Username);
        return Ok(new ResultDto<bool>
        {
            Value = result
        });
    }

    [HttpDelete]
    public IActionResult Logout()
    {
        if (Request.Cookies.ContainsKey("token")) Response.Cookies.Delete("token");
        return Ok();
    }
}
public record RegisterRequest(string FirstName,string LastName,string Username,string? Bio,string Email,string Password);
public record LoginRequest(string UsernameOrEmail,string Password);
public record EmailExistsRequest(string? Email);
public record UsernameExistsRequest(string? Username);