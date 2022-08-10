using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapp.API.ApiExtensions;
using webapp.API.Data;
using webapp.API.DTOs;
using webapp.API.Services;

namespace webapp.API.Controllers;

public class UserController : ApiController
{
    private readonly AppDbContext _ctx;
    private readonly CurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public UserController(AppDbContext ctx,CurrentUserService currentUserService,IMapper mapper)
    {
        _ctx = ctx;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = new ResultDto<UserResponse>();
        var user = await _ctx.Users.FirstOrDefaultAsync(x => x.Id == _currentUserService.UserId);
        result.Value = _mapper.Map<UserResponse>(user);
        return Ok(result);
    }

    [HttpPut]
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