namespace webapp.Domain.Entities;

public class Tag
{
    public Tag()
    {
        Articles = new HashSet<ArticleTags>();
    }

    public string TagId { get; set; } = Guid.NewGuid().ToString();
    public string? Text { get; set; }
    public ICollection<ArticleTags>? Articles { get; set; }
}