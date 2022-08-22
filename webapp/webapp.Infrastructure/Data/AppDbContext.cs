using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using webapp.Application.Interfaces;
using webapp.Domain.Entities;

namespace webapp.Infrastructure.Data;

public sealed class AppDbContext : IdentityDbContext<ApplicationUser>, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
        ChangeTracker.LazyLoadingEnabled = false;
        ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
    }

    public DbSet<Article> Articles { get; set; } = null!;
    public DbSet<Comment> Comments { get; set; } = null!;
    public DbSet<UserFavorite> UserFavorites { get; set; } = null!;
    public DbSet<UserFollower> UserFollowers { get; set; } = null!;
    public DbSet<ArticleTags> ArticleTags { get; set; } = null!;
    public DbSet<Tag> Tags { get; set; } = null!;

    public async Task<int> SaveChangesAsync()
    {
        return await base.SaveChangesAsync();
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<ArticleTags>()
            .HasKey(x => new {x.ArticleId, x.TagId});

        builder.Entity<ArticleTags>()
            .HasOne(x => x.Article)
            .WithMany(x => x.Tags)
            .HasForeignKey(x => x.ArticleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ArticleTags>()
            .HasOne(x => x.Tag)
            .WithMany(x => x.Articles)
            .HasForeignKey(x => x.TagId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Article>()
            .HasOne(x => x.Author)
            .WithMany(x => x.Articles)
            .HasForeignKey(x => x.AuthorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Article>()
            .HasMany(x => x.Favorites)
            .WithOne(x => x.Article)
            .HasForeignKey(x => x.ArticleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<UserFavorite>()
            .HasOne(x => x.Article)
            .WithMany(x => x.Favorites)
            .HasForeignKey(x => x.ArticleId)
            .OnDelete(DeleteBehavior.Cascade);

        base.OnModelCreating(builder);

        foreach (var property in builder.Model.GetEntityTypes().Select(x => x.FindPrimaryKey())
                     .SelectMany(x => x!.Properties))
            property.ValueGenerated = ValueGenerated.OnAdd;
    }
}