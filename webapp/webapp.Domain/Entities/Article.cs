using System.ComponentModel.DataAnnotations.Schema;

namespace webapp.Domain.Entities;

public class Article
{
    public Article()
    {
        Tags = new HashSet<ArticleTags>();
        Comments = new HashSet<Comment>();
        Favorites = new HashSet<UserFavorite>();
    }

    public string? ArticleId { get; set; }
    public string? Slug { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public ICollection<ArticleTags> Tags { get; set; }
    public DateTimeOffset? CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public string? Body { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public int FavoritesCount { get; set; }
    [NotMapped] public bool IsFollowing { get; set; }
    [NotMapped] public string?[]? TagsArray { get; set; }
    public ICollection<Comment>? Comments { get; set; }
    public string? AuthorId { get; set; }
    public virtual ApplicationUser? Author { get; set; }
    public ICollection<UserFavorite>? Favorites { get; set; }
}