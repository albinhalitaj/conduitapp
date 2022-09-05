using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using webapp.Application.Interfaces;

namespace webapp.API.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    public CurrentUserService(IHttpContextAccessor httpContextAccessor) => _httpContextAccessor = httpContextAccessor;

    public string? UserId
    {
        get
        {
            var isAuthenticated = _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
            if (isAuthenticated)
            {
                return _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name);
            }

            var token = _httpContextAccessor.HttpContext?.Request.Cookies["token"] ?? "";
            return DecodeJwt(token);
        }
    }

    private static string DecodeJwt(string jwt)
    {
        var handler = new JwtSecurityTokenHandler();

        var jwtSecurityToken = handler.ReadJwtToken(jwt);
        var claims = jwtSecurityToken.Claims.ToList();
        return claims[1].Value;
    }

}