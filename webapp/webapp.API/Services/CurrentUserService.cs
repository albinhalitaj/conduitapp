using System.Security.Claims;
using Newtonsoft.Json;
using webapp.Application.Interfaces;
using webapp.Contracts.Users;

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
            var userCookie = _httpContextAccessor.HttpContext?.Request.Cookies["user"];
            var user = JsonConvert.DeserializeObject<User>(userCookie ?? "");
            return user?.Id;
        }
    }
}