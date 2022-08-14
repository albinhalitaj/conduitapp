using webapp.API.Models;

namespace webapp.API.DTOs;

public record CreateArticleRequest(string Title,string Description,string Body,string[]? Tags);
public record UpdateArticleRequest(string Title, string Body, string Description, string[]? Tags);
public record ArticleResponse(string? Slug, string? Title, string? Description, string? Body, DateTimeOffset? CreatedAt,
    DateTimeOffset UpdatedAt,int FavoritesCount,
    string?[]? Tags, Author Author);