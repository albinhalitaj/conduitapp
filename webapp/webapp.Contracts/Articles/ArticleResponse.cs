using webapp.Contracts.Authors;

namespace webapp.Contracts.Articles;

public record ArticleResponse(string? Slug, string? Title, string? Description, string? Body, DateTimeOffset? CreatedAt,
    DateTimeOffset UpdatedAt, bool IsFavorited, int FavoritesCount,
    string?[]? Tags, Author Author);