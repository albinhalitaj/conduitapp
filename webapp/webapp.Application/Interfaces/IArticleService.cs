using webapp.Contracts.Articles;
using webapp.Contracts.Common;
using webapp.Domain.Enums;

namespace webapp.Application.Interfaces;

public interface IArticleService
{
    Task<ResultDto<List<ArticleResponse>>> GetAllArticlesAsync(QueryParams queryParams);
    Task<ResultDto<List<ArticleResponse>>> Feed(QueryParams queryParams);
    Task<ResultDto<ArticleResponse>> GetArticleAsync(string slug);
    Task<ResultDto<List<ArticleResponse>>> GetArticleByAuthorAsync(string author);
    Task<ResultDto<List<ArticleResponse>>> GetArticleByTagAsync(string tag);
    Task<ResultDto<List<ArticleResponse>>> GetArticleByFavorites(string author);
    Task<ResultDto<ArticleResponse>> FavoriteArticle(string slug);
    Task<ResultDto<ArticleResponse>> UnFavoriteArticle(string slug);
    Task<List<ArticleResponse>> GetArticleByTypeAsync(ArticleType type,string value);
    Task<ResultDto<ArticleResponse>> CreateArticleAsync(CreateArticleRequest article);
    Task<ResultDto<ArticleResponse>> UpdateArticleAsync(string slug, UpdateArticleRequest updatedArticle);
    Task<ResultDto<string>> DeleteArticleAsync(string slug);
}