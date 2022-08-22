using Microsoft.EntityFrameworkCore;
using webapp.Application.Interfaces;
using webapp.Domain.Entities;

namespace webapp.Application.Services;

public static class ArticleExtension
{
    public static IEnumerable<Article> MapIsFollowing(this List<Article> source, IAppDbContext db, string userId)
    {
        var isUserFollowing = db.UserFollowers.Where(x =>
            x.FollowerId == userId).Select(x => x.UserId).ToList();

        foreach (var follower in isUserFollowing)
        {
            foreach (var article in source)
            {
                article.IsFollowing = follower == article.AuthorId;
            }
        }

        return source;
    }
}