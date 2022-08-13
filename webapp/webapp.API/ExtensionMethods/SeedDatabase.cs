using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using webapp.API.Data;

namespace webapp.API.ExtensionMethods;

public static class SeedDatabase
{
    public static async Task SeedData(this IApplicationBuilder app)
    {
        ArgumentNullException.ThrowIfNull(app, nameof(app));

        using var scope = app.ApplicationServices.CreateScope();
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<AppDbContext>();
            Console.WriteLine("Migrating...");
            await context.Database.MigrateAsync();
            await DbSeed.Initialize(context);
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
    }
}