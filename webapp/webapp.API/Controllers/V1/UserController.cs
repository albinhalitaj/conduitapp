using AutoMapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapp.API.Services;
using webapp.Application.Interfaces;
using webapp.Contracts.Users;

namespace webapp.API.Controllers.V1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class UserController : ControllerBase
{
    private readonly IAppDbContext _ctx;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;
    private readonly IIdentityService _identityService;

    public UserController(IAppDbContext ctx, ICurrentUserService currentUserService, IMapper mapper, IIdentityService identityService)
    {
        _ctx = ctx;
        _currentUserService = currentUserService;
        _mapper = mapper;
        _identityService = identityService;
    }

    [HttpGet,Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> Get()
    {
        var user = await _ctx.Users.FirstOrDefaultAsync(x => x.Id == _currentUserService.UserId);
        return Ok(_mapper.Map<UserResponse>(user));
    }

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _identityService.RegisterAsync(request);
        return result.Success
            ? Ok(result.Value)
            : Problem(statusCode: StatusCodes.Status400BadRequest, title: result.Errors.SingleOrDefault()?.Message);
    }

    [Route(nameof(Login)),AllowAnonymous,HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _identityService.LoginAsync(request);
        return response.Success
            ? Ok(response.Value)
            : Problem(statusCode: StatusCodes.Status401Unauthorized, title: response.Errors.SingleOrDefault()?.Message);
    }

    [HttpPost,Route(nameof(EmailExists))]
    public async Task<IActionResult> EmailExists([FromBody] EmailExistsRequest req)
    {
        var result = await _identityService.EmailExists(req.Email);
        return Ok(new 
        {
            EmailExists = result
        });
    }

    [HttpPost,Route(nameof(UsernameExists))]
    public async Task<IActionResult> UsernameExists([FromBody] UsernameExistsRequest req)
    {
        var result = await _identityService.UsernameExists(req.Username);
        return Ok(new 
        {
            UsernameExists = result
        });
    }

    [HttpDelete,Authorize]
    public IActionResult Logout()
    {
        if (Request.Cookies.ContainsKey("token")) Response.Cookies.Delete("token");
        return Ok();
    }

    [HttpPut,Authorize]
    public async Task<IActionResult> UpdateUser([FromBody] UpdateUserRequest request)
    {
        var response = await _identityService.UpdateUser(request);
        return response.Success
            ? Ok(response)
            : Problem(statusCode: StatusCodes.Status400BadRequest, title: response.Errors.SingleOrDefault()?.Message);
    }
}

