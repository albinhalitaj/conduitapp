using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using webapp.Application.Interfaces;
using webapp.Infrastructure.Data;
using webapp.Infrastructure.Extensions;
using webapp.Infrastructure.Identity;

namespace webapp.Infrastructure;

public static class ConfigureServices
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>((sp,x ) =>
        {
            var interceptor = sp.GetRequiredService<AuditableEntityInterceptor>();
            x.UseSqlServer(configuration.GetConnectionString("AppConn"),
                    b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName))
                .AddInterceptors(interceptor);
        });
        
        services.AddSingleton<AuditableEntityInterceptor>();
        services.AddScoped<IAppDbContext>(provider =>
            provider.GetService<AppDbContext>() ?? throw new InvalidOperationException());
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddJwtAuth(configuration);
        services.ConfigureIdentityProviders();
        
        return services;
    }
}