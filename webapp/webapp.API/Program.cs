using webapp.API;
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

if (app.Environment.IsDevelopment())
{
    app.ConfigureApp();
    await app.SeedData();
}

// Middlewares
{
    app.UseHttpsRedirection();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();
    app.Run();
}
