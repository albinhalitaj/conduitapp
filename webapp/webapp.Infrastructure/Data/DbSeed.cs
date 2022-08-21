using Microsoft.AspNetCore.Identity;

namespace webapp.Infrastructure.Data;

internal static class DbSeed
{
    internal static async Task Initialize(AppDbContext ctx)
    {
        ArgumentNullException.ThrowIfNull(ctx, nameof(ctx));
        if (ctx.Roles.Any()) return;

        var roles = new List<IdentityRole>
        {
            new()
            {
                Name = "User",
                NormalizedName = "USER"
            },
            new()
            {
                Name = "Admin",
                NormalizedName = "ADMIN"
            }
        };

        await ctx.Roles.AddRangeAsync(roles);
        await ctx.SaveChangesAsync();
    }
}