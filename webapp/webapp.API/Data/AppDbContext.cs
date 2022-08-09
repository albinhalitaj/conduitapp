using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using webapp.API.Models;

namespace webapp.API.Data;

public sealed class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
        ChangeTracker.LazyLoadingEnabled = false;
    } 
    public DbSet<Article> Articles { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<UserFavorite> UserFavorites { get; set; }
    public DbSet<UserFollower> UserFollowers { get; set; }
    public DbSet<ArticleTags> ArticleTags { get; set; }
    public DbSet<Tag> Tags { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer(options =>
        {
            options.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
        });
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<ArticleTags>()
            .HasKey(x => new {x.ArticleId, x.TagId});

        builder.Entity<ArticleTags>()
            .HasOne(x => x.Article)
            .WithMany(x => x.Tags)
            .HasForeignKey(x=>x.ArticleId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.Entity<ArticleTags>()
            .HasOne(x => x.Tag)
            .WithMany(x => x.Articles)
            .HasForeignKey(x=>x.TagId)
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
        
        var keysProperties = builder.Model.GetEntityTypes().Select(x => x.FindPrimaryKey()).SelectMany(x => x!.Properties);
        foreach (var property in keysProperties)
        {
            property.ValueGenerated = ValueGenerated.OnAdd;
        }
    }
}