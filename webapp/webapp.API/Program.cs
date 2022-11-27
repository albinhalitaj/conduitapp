using webapp.API;
using webapp.API.Hubs;
using webapp.Application;
using webapp.Infrastructure;
using webapp.Infrastructure.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Services
{
    builder.Services
        .AddPresentation()
        .AddInfrastructure(builder.Configuration)
        .AddApplication();
}

var app = builder.Build();

app.ConfigureApp();
await app.SeedData();


// Middlewares
{
    app.UseHttpsRedirection();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();
    app.MapHub<AppHub>("/apphub");
    app.Run();
}