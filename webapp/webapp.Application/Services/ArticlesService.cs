using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using webapp.Application.Common;
using webapp.Application.Interfaces;
using webapp.Contracts.Articles;
using webapp.Contracts.Authors;
using webapp.Contracts.Common;
using webapp.Domain.Entities;
using webapp.Domain.Enums;

namespace webapp.Application.Services;

public class ArticlesService : IArticleService
{
    private readonly IAppDbContext _ctx;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;
    private readonly ITagService _tagService;

    public ArticlesService(IAppDbContext ctx, ICurrentUserService currentUserService, IMapper mapper,
        ITagService tagService)
    {
        _ctx = ctx;
        _currentUserService = currentUserService;
        _mapper = mapper;
        _tagService = tagService;
    }

    public async Task<ResultDto<List<ArticleResponse>>> GetAllArticlesAsync(QueryParams queryParams)
    {
        var paginator = new Paginator(queryParams.Limit, queryParams.Offset);
        var response = new ResultDto<List<ArticleResponse>>();
        var articles = await GetArticleByTypeAsync(ArticleType.All, string.Empty);
        response.Value = articles.Skip(paginator.Offset).Take(paginator.Limit).ToList();
        return response;
    }

    public async Task<ResultDto<List<ArticleResponse>>> Feed(QueryParams queryParams)
    {
        var paginator = new Paginator(queryParams.Limit, queryParams.Offset);
        var response = new ResultDto<List<ArticleResponse>>();
        var articles = await GetArticleByTypeAsync(ArticleType.Feed, string.Empty);
        response.Value = articles.Skip(paginator.Offset).Take(paginator.Limit).ToList();
        return response;
    }

    public async Task<ResultDto<ArticleResponse>> GetArticleAsync(string slug)
    {
        var response = new ResultDto<ArticleResponse>();
        var article = await GetArticleByTypeAsync(ArticleType.Slug, slug);
        if (article.Count > 0)
        {
            response.Value = article.FirstOrDefault();
            return response;
        }

        response.Errors = new List<ErrorDto>
            {new() {Message = $"Article with slug {slug} was not found!", ErrorCode = "NotFound"}};
        return response;
    }

    public async Task<ResultDto<List<ArticleResponse>>> GetArticleByAuthorAsync(string authorName) =>
        new()
        {
            Value = await GetArticleByTypeAsync(ArticleType.Author, authorName)
        };

    public async Task<ResultDto<List<ArticleResponse>>> GetArticleByTagAsync(string tag) =>
        new()
        {
            Value = await GetArticleByTypeAsync(ArticleType.Tag, tag)
        };

    public async Task<ResultDto<List<ArticleResponse>>> GetArticleByFavorites(string author) =>
        new()
        {
            Value = await GetArticleByTypeAsync(ArticleType.AuthorFavorites, author)
        };

    public async Task<ResultDto<ArticleResponse>> FavoriteArticle(string slug)
    {
        var result = new ResultDto<ArticleResponse>();
        var article = await _ctx.Articles.FirstOrDefaultAsync(x => x.Slug == slug);
        if (article is not null)
        {
            var isAlreadyFavorited = await _ctx.UserFavorites
                .AnyAsync(x => x.ArticleId == article.ArticleId && x.UserId == _currentUserService.UserId);
            if (!isAlreadyFavorited)
            {
                try
                {
                    var userFavorite = new UserFavorite
                    {
                        ArticleId = article.ArticleId,
                        UserId = _currentUserService.UserId
                    };
                    await _ctx.UserFavorites.AddAsync(userFavorite);
                    article.FavoritesCount++;
                    var res = await _ctx.SaveChangesAsync();
                    if (res > 0)
                    {
                        var art = await GetArticleByTypeAsync(ArticleType.Slug, article.Slug!);
                        result.Value = art.SingleOrDefault();
                    }
                }
                catch (Exception e)
                {
                    result.Errors = new List<ErrorDto> {new() {Message = e.Message}};
                }
            }
            else
            {
                result.Errors = new List<ErrorDto>
                    {new() {Message = "Article is already favorited!", ErrorCode = "AlreadyFavorited"}};
            }
        }
        else
        {
            result.Errors = new List<ErrorDto>
                {new() {Message = $"Could not find article with slug {slug}", ErrorCode = "NotFound"}};
        }

        return result;
    }

    public async Task<ResultDto<ArticleResponse>> UnFavoriteArticle(string slug)
    {
        var result = new ResultDto<ArticleResponse>();
        var article = await _ctx.Articles.FirstOrDefaultAsync(x => x.Slug == slug);
        try
        {
            if (article is not null)
            {
                var userFavoriteArticle = await _ctx.UserFavorites.FirstOrDefaultAsync(x =>
                    x.ArticleId == article.ArticleId && x.UserId == _currentUserService.UserId);
                if (userFavoriteArticle != null)
                {
                    _ctx.UserFavorites.Remove(userFavoriteArticle);
                    article.FavoritesCount = article.FavoritesCount > 0 ? article.FavoritesCount-- : 0;
                    await _ctx.SaveChangesAsync();
                }
                else
                {
                    result.Errors = new List<ErrorDto>
                        {new() {Message = $"No article favorite found with slug {slug}", ErrorCode = "NotFound"}};
                }
            }
            else
            {
                result.Errors = new List<ErrorDto>
                    {new() {Message = $"No article found with slug {slug}", ErrorCode = "NotFound"}};
            }
        }
        catch (Exception e)
        {
            result.Errors = new List<ErrorDto> {new() {Message = e.Message}};
        }

        return result;
    }

    public async Task<List<ArticleResponse>> GetArticleByTypeAsync(ArticleType type, string value)
    {
        var articles = type switch
        {
            ArticleType.Author => await GetArticlesByAuthorOrSlug(ArticleType.Author, value),
            ArticleType.Slug => await GetArticlesByAuthorOrSlug(ArticleType.Slug, value),
            ArticleType.All => await GetArticlesByAuthorOrSlug(ArticleType.All, string.Empty),
            ArticleType.Feed => await _ctx.UserFollowers.AsSplitQuery()
                .AsNoTracking()
                .Where(x => x.FollowerId == _currentUserService.UserId)
                .Select(a => a.User!.Articles)
                .SelectMany(t => t)
                .ProjectToType<Article>()
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync(),
            ArticleType.Tag => await _ctx.ArticleTags.AsSplitQuery().AsNoTracking()
                .Where(x => x.Tag!.Text == value)
                .ProjectToType<Article>().OrderByDescending(x => x.CreatedAt).ToListAsync(),
            _ => new List<Article>()
        };

        if (type == ArticleType.AuthorFavorites)
        {
            var user = await _ctx.Users.AsNoTracking().AnyAsync(x => x.UserName == value);
            if (user)
            {
                articles = await _ctx.UserFavorites.AsSplitQuery().AsNoTracking().Where(x => x.UserId == x.User!.Id)
                    .ProjectToType<Article>()
                    .OrderByDescending(x => x.CreatedAt)
                    .ToListAsync();
            }
        }


        return articles.Count == 0
            ? Enumerable.Empty<ArticleResponse>().ToList()
            : articles
                .MapIsFollowing(_ctx, _currentUserService.UserId ?? "")
                .Select(article => new
                {
                    article,
                    author = new Author(article.Author!.UserName, article.Author.Bio, article.Author.Image,
                        article.IsFollowing)
                })
                .Select(t => new ArticleResponse(t.article.Slug, t.article.Title, t.article.Description,
                    t.article.Body, t.article.CreatedAt, t.article.UpdatedAt, t.article.FavoritesCount,
                    t.article.TagsArray, t.author)).ToList();
    }

    private async Task<List<Article>> GetArticlesByAuthorOrSlug(ArticleType type, string value)
    {
        var articles = await _ctx.Articles.AsNoTracking()
            .AsSplitQuery()
            .Where(x => type == ArticleType.Slug
                ? x.Slug == value
                : type != ArticleType.Author || x.Author!.UserName == value)
            .ProjectToType<Article>()
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
        return articles;
    }

    public async Task<ResultDto<ArticleResponse>> CreateArticleAsync(CreateArticleRequest article)
    {
        var result = new ResultDto<ArticleResponse>();
        var tags = new List<ArticleTags>();
        try
        {
            var articleToCreate = _mapper.Map<Article>(article);
            if (article.Tags is not null && article.Tags.Length > 0)
            {
                foreach (var articleTag in article.Tags)
                {
                    var tag = await _tagService.CheckIfExists(articleTag);
                    if (tag is null)
                    {
                        var tagId = await _tagService.CreateTagAsync(articleTag);
                        if (tagId != string.Empty)
                        {
                            tags.Add(new ArticleTags {TagId = tagId, ArticleId = articleToCreate.ArticleId});
                        }
                        else
                        {
                            result.Errors = new List<ErrorDto> {new() {Message = tagId}};
                            return result;
                        }
                    }
                    else
                    {
                        tags.Add(new ArticleTags {TagId = tag, ArticleId = articleToCreate.ArticleId});
                    }
                }
            }

            var slugExists = await _ctx.Articles.AnyAsync(x => x.Slug == articleToCreate.Slug);

            if (!slugExists)
            {
                await _ctx.Articles.AddAsync(articleToCreate);
                await _ctx.ArticleTags.AddRangeAsync(tags);
                var res = await _ctx.SaveChangesAsync();
                if (res > 0)
                {
                    var response = await GetArticleByTypeAsync(ArticleType.Slug, articleToCreate.Slug!);
                    result.Value = response[0];
                }
            }
            else
            {
                result.Errors = new List<ErrorDto>
                    {new() {Message = "Article with this slug already exists!", ErrorCode = "AlreadyExists"}};
            }
        }
        catch (Exception e)
        {
            result.Errors = new List<ErrorDto> {new() {Message = e.Message}};
        }

        return result;
    }

    public async Task<ResultDto<string>> DeleteArticleAsync(string slug)
    {
        var result = new ResultDto<string>();
        var article = await _ctx.Articles.FirstOrDefaultAsync(x => x.Slug == slug);

        if (article is not null && article.AuthorId == _currentUserService.UserId)
        {
            try
            {
                _ctx.Articles.Remove(article);
                var res = await _ctx.SaveChangesAsync();
                if (res > 0) result.Value = $"Article {slug} was deleted successfully!";
            }
            catch (Exception e)
            {
                result.Errors = new List<ErrorDto> {new() {Message = e.Message}};
            }
        }
        else
        {
            result.Errors = new List<ErrorDto>
                {new() {Message = $"Article with slug {slug} was not found!", ErrorCode = "NotFound"}};
        }

        return result;
    }

    public async Task<ResultDto<ArticleResponse>> UpdateArticleAsync(string slug, UpdateArticleRequest updatedArticle)
    {
        var result = new ResultDto<ArticleResponse>();
        try
        {
            var article = await _ctx.Articles.Include(x => x.Tags).FirstOrDefaultAsync(x => x.Slug == slug);
            if (article is null)
            {
                result.Errors = new List<ErrorDto>
                    {new() {Message = $"Article with slug {slug} was not found!", ErrorCode = "NotFound"}};
                return result;
            }

            if (article.Title != updatedArticle.Title)
            {
                article.Slug = updatedArticle.Title.Slugify();
            }

            article.Title = updatedArticle.Title;
            article.Body = updatedArticle.Body;
            article.Description = updatedArticle.Description;
            article.UpdatedAt = DateTimeOffset.UtcNow;
            var tags = new List<ArticleTags>();
            if (updatedArticle.Tags is not null && updatedArticle.Tags.Length > 0)
            {
                foreach (var articleTag in article.Tags)
                {
                    _ctx.ArticleTags.Remove(articleTag);
                }

                foreach (var articleTag in updatedArticle.Tags)
                {
                    var id = await _tagService.CheckIfExists(articleTag);
                    if (id is null)
                    {
                        var tagId = await _tagService.CreateTagAsync(articleTag);
                        if (tagId != string.Empty)
                            tags.Add(new ArticleTags {TagId = tagId, ArticleId = article.ArticleId});
                        else
                            result.Errors = new List<ErrorDto> {new() {Message = "Error while creating tags!"}};
                    }
                    else
                    {
                        tags.Add(new ArticleTags {TagId = id, ArticleId = article.ArticleId});
                    }
                }
            }

            await _ctx.ArticleTags.AddRangeAsync(tags);
            var res = await _ctx.SaveChangesAsync();
            if (res > 0)
            {
                var response = await GetArticleByTypeAsync(ArticleType.Slug, article.Slug!);
                result.Value = response[0];
            }
        }
        catch (Exception e)
        {
            result.Errors = new List<ErrorDto> {new() {Message = e.Message, ErrorCode = e.HelpLink}};
        }

        return result;
    }
}