namespace webapp.API.Models;

public class UserFavorite
{
    public string? UserFavoriteId { get; set; }
    public string? UserId { get; set; }
    public string? ArticleId { get; set; }

    public virtual ApplicationUser? User { get; set; }
    public virtual Article? Article { get; set; } 
}