using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using webapp.API.AppSettings;
using webapp.API.Data;
using webapp.API.Models;

namespace webapp.API.ExtensionMethods;

public static class Authentication
{
    public static void AddJwtAuth(this IServiceCollection service,IConfiguration configuration)
    {
        var appSettingsSection = configuration.GetSection(nameof(ApplicationSettings));
        service.Configure<ApplicationSettings>(appSettingsSection);

        var appSettings = appSettingsSection.Get<ApplicationSettings>();
        var key = Encoding.ASCII.GetBytes(appSettings.Secret ?? string.Empty);
        service.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, x =>
            {
                x.RequireHttpsMetadata = false;
                x.SaveToken = true;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = "www.companyName.com/api",
                    ValidAudience = "www.companyName.com"
                };
                x.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var token = context.Request.Cookies["token"];
                        context.Token = token;
                        return Task.CompletedTask;
                    }
                };
            });
    }

    public static void ConfigureIdentityProviders(this IServiceCollection services)
    {
        services.AddIdentity<ApplicationUser, IdentityRole>(opt =>
        {
            opt.Password.RequiredLength = 8;
            opt.Password.RequireUppercase = true;
            opt.Password.RequireLowercase = true;
            opt.Password.RequireDigit = true;
        })
        .AddEntityFrameworkStores<AppDbContext>()
        .AddDefaultTokenProviders();
    }
}