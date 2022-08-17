using Microsoft.EntityFrameworkCore;
using webapp.Domain.Entities;

namespace webapp.Application.Interfaces;

public interface IAppDbContext
{
    DbSet<Article> Articles { get; }
    DbSet<Comment> Comments { get; }
    DbSet<ApplicationUser> Users { get; }
    DbSet<UserFavorite> UserFavorites { get; }
    DbSet<UserFollower> UserFollowers { get; }
    DbSet<ArticleTags> ArticleTags { get; }
    DbSet<Tag> Tags { get; }
    Task<int> SaveChangesAsync();
}