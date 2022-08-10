using webapp.API.ApiExtensions;
using webapp.API.DTOs;
using webapp.API.Models;
using webapp.API.Services;

namespace webapp.API.Interfaces;

public interface IArticleService
{
    Task<List<ArticleResponse>> GetAllArticlesAsync();
    Task<ArticleResponse?> GetArticleAsync(string slug);
    Task<List<ArticleResponse>?> GetArticleByAuthorAsync(string author);
    Task<List<ArticleResponse>?> GetArticleByTagAsync(string tag);
    Task<ResultDto<List<ArticleResponse>>> GetArticleByFavorites(string author);
    Task<ResultDto<ArticleResponse>> FavoriteArticle(string slug);
    Task<ResultDto<ArticleResponse>> UnFavoriteArticle(string slug);
    Task<List<ArticleResponse>> GetArticleByTypeAsync(ArticleType type,string value);
    Task<ResultDto<ArticleResponse>> CreateArticleAsync(CreateArticle article);
    Task<ArticleResponse> UpdateArticleAsync(Guid id, UpdateArticle updatedArticle);
    Task<ResultDto<string>> DeleteArticleAsync(string slug);
}

public enum ArticleType
{
    Author = 0,
    Slug = 1,
    Tag = 2,
    All = 3,
    AuthorFavorites = 4
}