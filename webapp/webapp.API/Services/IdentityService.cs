using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using webapp.API.ApiExtensions;
using webapp.API.AppSettings;
using webapp.API.Constants;
using webapp.API.Controllers;
using webapp.API.Interfaces;
using webapp.API.Models;

namespace webapp.API.Services;

public class IdentityService : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IMapper _mapper;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ApplicationSettings _appSettings;
    
    public IdentityService(UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IOptions<ApplicationSettings> appSettings,
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _mapper = mapper;
        _httpContextAccessor = httpContextAccessor;
        _appSettings = appSettings.Value;
    }
    
    public async Task<ResultDto<RegisterResponse>> RegisterAsync(RegisterRequest model)
    {
        var response = new ResultDto<RegisterResponse>();
        var (firstName,lastName,username,bio, email, password) = model;
        var user = new ApplicationUser
        {
            UserName = username,
            Email = email,
            Bio = bio,
            FirstName = firstName,
            LastName = lastName
        };
        var registerResult = await _userManager.CreateAsync(user, password);
        if (registerResult.Succeeded)
        {
            await _userManager.AddToRoleAsync(user, RoleConstants.User);
            var userResult = _mapper.Map<RegisterResponse>(user);
            response.Value = userResult;
            return response;
        }
        response.Errors = registerResult.Errors
            .Select(error => new ErrorDto {Message = error.Description, ErrorCode = error.Code}).ToList();
        return response;
    }

    public async Task<ResultDto<User>> LoginAsync(LoginRequest request)
    {
        var response = new ResultDto<User>();
        var (usernameOrEmail, password) = request;
        var isEmail = usernameOrEmail.Contains('@');
        var userAccount = isEmail
            ? await _userManager.FindByEmailAsync(usernameOrEmail)
            : await _userManager.FindByNameAsync(usernameOrEmail);

        if (userAccount is not null)
        {
            var user = await _signInManager.CheckPasswordSignInAsync(userAccount,password,false);
            
            if (user.Succeeded)
            {
                var roles = await _userManager.GetRolesAsync(userAccount);
                var token = await GenerateToken(userAccount);
                _httpContextAccessor.HttpContext?.Response.Cookies.Append("token",token,new CookieOptions
                {
                    HttpOnly = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddHours(1)
                });
                response.Value = new User(userAccount.Id, userAccount.UserName, userAccount.Email,roles.ToArray(),DateTimeOffset.UtcNow.AddHours(1));
                return response;
            }
            response.Errors = new List<ErrorDto>
                {new() {Message = "Username or Email is incorrect", ErrorCode = "IncorrectUsernameOrEmail"}};
        }
        else
            response.Errors = new List<ErrorDto>
                {new() {Message = "User does not exists", ErrorCode = "UserDoesNotExists"}};

        return response;
    }

    public async Task<bool> EmailExists(string email)
    {
        var result = await _userManager.FindByEmailAsync(email);
        return result is not null;
    }

    public async Task<bool> UsernameExists(string username)
    {
        var result = await _userManager.FindByNameAsync(username);
        return result is not null;
    }

    private async Task<string> GenerateToken(ApplicationUser user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_appSettings.Secret ?? "");

        var roles = await _userManager.GetRolesAsync(user);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserName),
                new Claim(ClaimTypes.Name,user.Id),
                new Claim(ClaimTypes.Email, user.Email),
            }),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature),
            Issuer = "www.companyName.com/api",
            IssuedAt = DateTime.Now,
            Audience = "www.companyName.com"
        };

        foreach (var role in roles) 
            tokenDescriptor.Subject.AddClaim(new Claim(ClaimTypes.Role, role));

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

public record RegisterResponse(string Id, string UserName, string Email, string Role);
public record User(string Id,string Username, string Email,string[] Roles, DateTimeOffset ExpiresAt);