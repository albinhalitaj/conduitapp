using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapp.API.ApiExtensions;
using webapp.API.Data;
using webapp.API.DTOs;
using webapp.API.Interfaces;
using webapp.API.Services;

namespace webapp.API.Controllers.V1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class UserController : ControllerBase
{
    private readonly AppDbContext _ctx;
    private readonly CurrentUserService _currentUserService;
    private readonly IMapper _mapper;
    private readonly IIdentityService _identityService;

    public UserController(AppDbContext ctx,CurrentUserService currentUserService,IMapper mapper,IIdentityService identityService)
    {
        _ctx = ctx;
        _currentUserService = currentUserService;
        _mapper = mapper;
        _identityService = identityService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = new ResultDto<UserResponse>();
        var user = await _ctx.Users.FirstOrDefaultAsync(x => x.Id == _currentUserService.UserId);
        result.Value = _mapper.Map<UserResponse>(user);
        return Ok(result);
    }
    
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
        var result = await _identityService.EmailExists(req.Email);
        return Ok(new ResultDto<bool>
        {
            Value = result
        });

    }
    [HttpPost,Route(nameof(UsernameExists))]
    public async Task<IActionResult> UsernameExists([FromBody] UsernameExistsRequest req)
    {
        var result = await _identityService.UsernameExists(req.Username);
        return Ok(new ResultDto<bool>
        {
            Value = result
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
        var result = new ResultDto<UserResponse>();
        var currentUser = await _ctx.Users.FirstOrDefaultAsync(x => x.Id == _currentUserService.UserId);
        if (request.Email != null)
        {
            currentUser!.Email = request.Email;
        } 
        if (request.Bio != null)
        {
            currentUser!.Bio = request.Bio;
        }
        if (request.Image != null)
        {
            currentUser!.Image = request.Image;
        }
        if (request.Username != null)
        {
            if (request.Username.Contains(' '))
            {
                var username = request.Username.Replace(" ", "");
                currentUser!.UserName = username;
            }
            else
            {
                currentUser!.UserName = request.Username;
            }
        }
        await _ctx.SaveChangesAsync();
        result.Value = _mapper.Map<UserResponse>(currentUser);
        return Ok(result);
    }
}

public record UpdateUserRequest(string? Email,string? Username, string? Image,string? Bio);
public record RegisterRequest(string FirstName,string LastName,string Username,string? Bio,string Email,string Password);
public record LoginRequest(string UsernameOrEmail,string Password);
public record EmailExistsRequest(string Email);
public record UsernameExistsRequest(string Username);
