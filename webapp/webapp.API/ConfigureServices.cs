using Microsoft.OpenApi.Models;
using webapp.API.ExtensionMethods;
using webapp.API.Filters;
using webapp.API.Services;
using webapp.Application.Interfaces;

namespace webapp.API;

public static class ConfigureServices
{
    public static IServiceCollection AddPresentation(this IServiceCollection services)
    {
        services.AddControllers(opt => opt.Filters.Add<ValidationFilter>()).AddNewtonsoftJson(options =>
            options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
        );

        services.AddHttpContextAccessor();
        services.ConfigureFluentValidation();

        services.AddSignalR();

        services.AddSwaggerGen(s =>
        {
            s.SwaggerDoc("v1", new OpenApiInfo {Title = "Real World Conduit App API", Version = "v1"});
            s.SwaggerDoc("v2", new OpenApiInfo {Title = "Real World Conduit App API", Version = "v2"});
        });

        services.ConfigureApiVersioning();
        services.Configure<RouteOptions>(options => options.LowercaseUrls = true);

        services.AddSingleton<ICurrentUserService, CurrentUserService>();
        return services;
    }

    public static void ConfigureApp(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
            app.UseExceptionHandler("/error");
            app.UseSwagger();
            app.UseSwaggerUI(x =>
            {
                x.SwaggerEndpoint("/swagger/v1/swagger.json", "Version 1");
                x.SwaggerEndpoint("/swagger/v2/swagger.json", "Version 2");
            });
        }

        app.UseCors(x => x.AllowAnyHeader()
            .WithOrigins("http://localhost:4200")
            .AllowCredentials()
            .AllowAnyMethod());
    }
}