using Microsoft.EntityFrameworkCore;
using webapp.Domain.Entities;

namespace webapp.Application.Interfaces;

public interface IAppDbContext
{
    DbSet<Article> Articles { get; set; } 
    DbSet<Comment> Comments { get; set; } 
    DbSet<ApplicationUser> Users { get; set; }
    DbSet<UserFavorite> UserFavorites { get; set; } 
    DbSet<UserFollower> UserFollowers { get; set; }
    DbSet<ArticleTags> ArticleTags { get; set; } 
    DbSet<Tag> Tags { get; set; }
    Task<int> SaveChangesAsync();
    void Remove<TEntity>(TEntity entity);
}