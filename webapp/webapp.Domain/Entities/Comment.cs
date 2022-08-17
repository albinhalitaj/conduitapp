namespace webapp.Domain.Entities;

public class Comment
{
    public string? CommentId { get; set; } = Guid.NewGuid().ToString();
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; }
    public string? Body { get; set; }

    public string? ArticleId { get; set; }
    public virtual Article Article { get; set; } = null!;

    public string? AuthorId { get; set; }
    public virtual ApplicationUser Author { get; set; } = null!;
}