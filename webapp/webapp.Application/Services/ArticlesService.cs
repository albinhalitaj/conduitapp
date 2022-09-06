using Mapster;
using MapsterMapper;
using Markdig;
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
        var response = new ResultDto<List<ArticleResponse>>();
        var articles = await GetArticleByTypeAsync(ArticleType.All, string.Empty, queryParams);
        response.Value = articles;
        return response;
    }

    public async Task<ResultDto<List<ArticleResponse>>> Feed(QueryParams queryParams)
    {
        var response = new ResultDto<List<ArticleResponse>>();
        var articles = await GetArticleByTypeAsync(ArticleType.Feed, string.Empty, queryParams);
        response.Value = articles;
        return response;
    }

    public async Task<ResultDto<ArticleResponse>> GetArticleAsync(string slug)
    {
        var response = new ResultDto<ArticleResponse>();
        var article = await GetArticleByTypeAsync(ArticleType.Slug, slug, null);
        if (article.Any())
        {
            response.Value = article.FirstOrDefault();
            return response;
        }

        response.Errors = new List<ErrorDto>
            { new() { Message = $"Article with slug {slug} was not found!", ErrorCode = "NotFound" } };
        return response;
    }

    public async Task<ResultDto<List<ArticleResponse>>> GetArticleByAuthorAsync(string authorName)
    {
        return new ResultDto<List<ArticleResponse>>
        {
            Value = await GetArticleByTypeAsync(ArticleType.Author, authorName, null)
        };
    }

    public async Task<ResultDto<List<ArticleResponse>>> GetArticleByTagAsync(string tag)
    {
        return new ResultDto<List<ArticleResponse>>
        {
            Value = await GetArticleByTypeAsync(ArticleType.Tag, tag, null)
        };
    }

    public async Task<ResultDto<List<ArticleResponse>>> GetArticleByFavorites(string author)
    {
        return new ResultDto<List<ArticleResponse>>
        {
            Value = await GetArticleByTypeAsync(ArticleType.AuthorFavorites, author, null)
        };
    }

    public async Task<ResultDto<ArticleResponse>> FavoriteArticle(string slug)
    {
        var result = new ResultDto<ArticleResponse>();
        var article = await _ctx.Articles.AsTracking().FirstOrDefaultAsync(x => x.Slug == slug);
        if (article is not null)
        {
            var isAlreadyFavorited = await _ctx.UserFavorites.AnyAsync(x =>
                x.ArticleId == article.ArticleId && x.UserId == _currentUserService.UserId);
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
                    ++article.FavoritesCount;
                    var res = await _ctx.SaveChangesAsync();
                    if (res > 0)
                    {
                        var art = await GetArticleByTypeAsync(ArticleType.Slug, article.Slug!, null);
                        result.Value = art.SingleOrDefault();
                    }
                }
                catch (Exception e)
                {
                    result.Errors = new List<ErrorDto> { new() { Message = e.Message } };
                }
            }
            else
            {
                result.Errors = new List<ErrorDto> { new() { Message = "Article is already favorited!", ErrorCode = "AlreadyFavorited" } };
            }
        }
        else
        {
            result.Errors = new List<ErrorDto> { new() { Message = $"Could not find article with slug {slug}", ErrorCode = "NotFound" } };
        }

        return result;
    }

    public async Task<ResultDto<ArticleResponse>> UnFavoriteArticle(string slug)
    {
        var result = new ResultDto<ArticleResponse>();
        var article = await _ctx.Articles.AsTracking().FirstOrDefaultAsync(x => x.Slug == slug);
        try
        {
            if (article is not null)
            {
                var userFavoriteArticle = await _ctx.UserFavorites.FirstOrDefaultAsync(x =>
                    x.ArticleId == article.ArticleId && x.UserId == _currentUserService.UserId);
                if (userFavoriteArticle != null)
                {
                    _ctx.UserFavorites.Remove(userFavoriteArticle);
                    article.FavoritesCount = article.FavoritesCount > 0 ? article.FavoritesCount - 1 : 0;
                    await _ctx.SaveChangesAsync();
                }
                else
                {
                    result.Errors = new List<ErrorDto> { new() { Message = $"No article favorite found with slug {slug}", ErrorCode = "NotFound" } };
                }
            }
            else
            {
                result.Errors = new List<ErrorDto>
                    { new() { Message = $"No article found with slug {slug}", ErrorCode = "NotFound" } };
            }
        }
        catch (Exception e)
        {
            result.Errors = new List<ErrorDto> { new() { Message = e.Message } };
        }

        var updated = await GetArticleByTypeAsync(ArticleType.Slug, slug, null);
        result.Value = updated.FirstOrDefault();
        return result;
    }

    public async Task<List<ArticleResponse>> GetArticleByTypeAsync(ArticleType type, string value,
        QueryParams? queryParams)
    {
        var paginator = new Paginator(0, 0);
        if (queryParams is not null)
        {
            paginator = new Paginator(queryParams.Limit, queryParams.Offset);
        }

        var articles = type switch
        {
            ArticleType.Author => await GetArticlesByAuthorOrSlug(ArticleType.Author, value, queryParams),
            ArticleType.Slug => await GetArticlesByAuthorOrSlug(ArticleType.Slug, value, queryParams),
            ArticleType.All => await GetArticlesByAuthorOrSlug(ArticleType.All, string.Empty, queryParams),
            ArticleType.Feed => await _ctx.UserFollowers.AsSplitQuery()
                .Where(x => x.FollowerId == _currentUserService.UserId)
                .Select(a => a.User!.Articles)
                .SelectMany(t => t)
                .ProjectToType<Article>()
                .OrderByDescending(x => x.CreatedAt)
                .Skip(paginator.Offset)
                .Take(paginator.Limit)
                .ToListAsync(),
            ArticleType.Tag => await _ctx.ArticleTags.AsSplitQuery()
                .Where(x => x.Tag!.Text == value)
                .ProjectToType<Article>().OrderByDescending(x => x.CreatedAt).ToListAsync(),
            _ => new List<Article>()
        };

        // ReSharper disable once InvertIf
        if (type == ArticleType.AuthorFavorites)
        {
            var user = await _ctx.Users.Where(x => x.UserName == value)
                .Select(x => x.Id).FirstOrDefaultAsync();
            if (user is not null)
            {
                articles = await _ctx.UserFavorites
                    .AsSplitQuery()
                    .Where(x => x.UserId == user)
                    .ProjectToType<Article>()
                    .OrderByDescending(x => x.CreatedAt)
                    .ToListAsync();
            }
            else
            {
                articles = new List<Article>();
            }
        }

        var pipeline = new MarkdownPipelineBuilder().UseAdvancedExtensions().Build();

        return !articles.Any()
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
                    Markdown.ToHtml(t.article.Body ?? "",pipeline), t.article.CreatedAt, t.article.UpdatedAt, t.article.IsFavorited,
                    t.article.FavoritesCount, t.article.TagsArray, t.author)).ToList();
    }

    private async Task<List<Article>> GetArticlesByAuthorOrSlug(ArticleType type, string value,
        QueryParams? queryParams)
    {
        IQueryable<Article> articlesQuery = _ctx.Articles
            .AsSplitQuery()
            .Where(x => type == ArticleType.Slug
                ? x.Slug == value
                : type != ArticleType.Author || x.Author!.UserName == value)
            .ProjectToType<Article>()
            .OrderByDescending(x => x.CreatedAt);
        if (queryParams is not null)
        {
            var paginator = new Paginator(queryParams.Limit, queryParams.Offset);
            articlesQuery = _ctx.Articles
                .AsSplitQuery()
                .Where(x => type == ArticleType.Slug
                    ? x.Slug == value
                    : type != ArticleType.Author || x.Author!.UserName == value)
                .ProjectToType<Article>()
                .OrderByDescending(x => x.CreatedAt)
                .Skip(paginator.Offset)
                .Take(paginator.Limit);
        }

        var articles = await articlesQuery.ToListAsync();
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
                            tags.Add(new ArticleTags { TagId = tagId, ArticleId = articleToCreate.ArticleId });
                        }
                        else
                        {
                            result.Errors = new List<ErrorDto> { new() { Message = tagId } };
                            return result;
                        }
                    }
                    else
                    {
                        tags.Add(new ArticleTags { TagId = tag, ArticleId = articleToCreate.ArticleId });
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
                    var response = await GetArticleByTypeAsync(ArticleType.Slug, articleToCreate.Slug!, null);
                    result.Value = response[0];
                }
            }
            else
            {
                result.Errors = new List<ErrorDto> { new() { Message = "Article with this slug already exists!", ErrorCode = "AlreadyExists" } };
            }
        }
        catch (Exception e)
        {
            result.Errors = new List<ErrorDto> { new() { Message = e.Message } };
        }

        return result;
    }

    public async Task<ResultDto<string>> DeleteArticleAsync(string slug)
    {
        var result = new ResultDto<string>();
        var article = await _ctx.Articles.Where(x => x.Slug == slug).Select(a => a.ArticleId).FirstOrDefaultAsync();

        if (article is not null && article == _currentUserService.UserId)
        {
            try
            {
                _ctx.Articles.Remove(new Article { ArticleId = article});
                var res = await _ctx.SaveChangesAsync();
                if (res > 0) result.Value = $"Article {slug} was deleted successfully!";
            }
            catch (Exception e)
            {
                result.Errors = new List<ErrorDto> { new() { Message = e.Message } };
            }
        }
        else
        {
            result.Errors = new List<ErrorDto> { new() { Message = $"Article with slug {slug} was not found!", ErrorCode = "NotFound" } };
        }

        return result;
    }

    public async Task<ResultDto<ArticleResponse>> UpdateArticleAsync(string slug, UpdateArticleRequest updatedArticle)
    {
        var result = new ResultDto<ArticleResponse>();
        try
        {
            var article = await _ctx.Articles.AsTracking().Include(x => x.Tags).FirstOrDefaultAsync(x => x.Slug == slug);
            if (article is null)
            {
                result.Errors = new List<ErrorDto> { new() { Message = $"Article with slug {slug} was not found!", ErrorCode = "NotFound" } };
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
                _ctx.ArticleTags.RemoveRange(article.Tags);

                foreach (var articleTag in updatedArticle.Tags)
                {
                    var id = await _tagService.CheckIfExists(articleTag);
                    if (id is null)
                    {
                        var tagId = await _tagService.CreateTagAsync(articleTag);
                        if (tagId != string.Empty)
                            tags.Add(new ArticleTags { TagId = tagId, ArticleId = article.ArticleId });
                        else
                            result.Errors = new List<ErrorDto> { new() { Message = "Error while creating tags!" } };
                    }
                    else
                    {
                        tags.Add(new ArticleTags { TagId = id, ArticleId = article.ArticleId });
                    }
                }
            }

            await _ctx.ArticleTags.AddRangeAsync(tags);
            var res = await _ctx.SaveChangesAsync();
            if (res > 0)
            {
                var response = await GetArticleByTypeAsync(ArticleType.Slug, article.Slug!, null);
                result.Value = response[0];
            }
        }
        catch (Exception e)
        {
            result.Errors = new List<ErrorDto> { new() { Message = e.Message, ErrorCode = e.HelpLink } };
        }

        return result;
    }
}