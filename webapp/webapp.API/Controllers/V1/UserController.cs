using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using webapp.Application.Interfaces;
using webapp.Contracts.Users;

namespace webapp.API.Controllers.V1;

public class UserController : ApiController
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IIdentityService _identityService;

    public UserController(ICurrentUserService currentUserService, IIdentityService identityService)
    {
        _currentUserService = currentUserService;
        _identityService = identityService;
    }

    [HttpGet, Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> Get()
    {
        var response = await _identityService.GetUser(_currentUserService.UserId!);
        return response.Success ? Ok(response.Value)
            : Problem(statusCode: StatusCodes.Status400BadRequest, title: response.Errors.SingleOrDefault()?.Message);
    }

    [HttpPost]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var result = await _identityService.RegisterAsync(request);
        return result.Success ? Ok(result.Value)
            : Problem(statusCode: StatusCodes.Status400BadRequest, title: result.Errors.SingleOrDefault()?.Message);
    }

    [Route(nameof(Login)), AllowAnonymous, HttpPost]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var response = await _identityService.LoginAsync(request);
        return response.Success ? Ok(response.Value) 
            : Problem(statusCode: StatusCodes.Status401Unauthorized, title: response.Errors.SingleOrDefault()?.Message);
    }

    [HttpPost, Route(nameof(EmailExists))]
    public async Task<IActionResult> EmailExists(EmailExistsRequest req)
    {
        var result = await _identityService.EmailExists(req.Email);
        return Ok(result);
    }

    [HttpPost, Route(nameof(UsernameExists))]
    public async Task<IActionResult> UsernameExists(UsernameExistsRequest req)
    {
        var result = await _identityService.UsernameExists(req.Username);
        return Ok(result);
    }

    [HttpDelete, Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public IActionResult Logout()
    {
        if (Request.Cookies.ContainsKey("token")) Response.Cookies.Delete("token",new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None
        });
        
        if(Request.Cookies.ContainsKey("user")) Response.Cookies.Delete("user", new CookieOptions
        {
            Secure = true,
            SameSite = SameSiteMode.None
        });

        return NoContent();
    }

    [HttpPut, Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> UpdateUser(UpdateUserRequest request)
    {
        var response = await _identityService.UpdateUser(request);
        return response.Success ? Ok( response.Value ) 
            : Problem(statusCode: StatusCodes.Status400BadRequest, title: response.Errors.SingleOrDefault()?.Message);
    }
}