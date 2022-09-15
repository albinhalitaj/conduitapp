using System.Runtime.InteropServices;
using webapp.Application.Interfaces;
using webapp.Domain.Entities;

namespace webapp.Application.Services;

public static class ArticleExtension
{
    public static IEnumerable<Article> MapIsFollowing(this List<Article> source, IAppDbContext db, string userId)
    {
        var userFollowers = db.UserFollowers.Where(x =>
            x.FollowerId == userId).Select(x => x.UserId).ToList();
        
        var userFavorites = db.UserFavorites.Where(x => x.UserId == userId).ToList();

        foreach (var article in source)
        {
            foreach (var userFollower in CollectionsMarshal.AsSpan(userFollowers))
            {
                article.IsFollowing = userFollower == article.AuthorId;
            }

            foreach (var userFavorite in CollectionsMarshal.AsSpan(userFavorites))
            {
                article.IsFavorited = userFavorite.ArticleId == article.ArticleId;
            }
        }
        
        return source;
    }
}