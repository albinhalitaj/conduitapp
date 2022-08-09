using webapp.API.Models;

namespace webapp.API.DTOs;

public record CreateArticle(string Title,string Description,string Body,string[] Tags);
public record UpdateArticle(string Slug,string Title,string Description,string Body,List<Tags> Tags);

public record ArticleResponse(string? Slug, string? Title, string? Description, string? Body, DateTimeOffset? CreatedAt,
    DateTimeOffset UpdatedAt,int FavoritesCount,
    string?[]? Tags, Author Author);

public record Tags(string Text);