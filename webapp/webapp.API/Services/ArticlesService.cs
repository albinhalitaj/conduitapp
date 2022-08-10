using AutoMapper;
using Microsoft.EntityFrameworkCore;
using webapp.API.ApiExtensions;
using webapp.API.Data;
using webapp.API.DTOs;
using webapp.API.ExtensionMethods;
using webapp.API.Interfaces;
using webapp.API.Models;

namespace webapp.API.Services;

public class ArticlesService : IArticleService
{
    private readonly AppDbContext _ctx;
    private readonly CurrentUserService _currentUserService;
    private readonly IMapper _mapper;
    private readonly ITagService _tagService;

    public ArticlesService(AppDbContext ctx,CurrentUserService currentUserService,IMapper mapper,ITagService tagService)
    {
        _ctx = ctx;
        _currentUserService = currentUserService;
        _mapper = mapper;
        _tagService = tagService;
    }

    public async Task<List<ArticleResponse>> GetAllArticlesAsync() => await GetArticleByTypeAsync(ArticleType.All,string.Empty);

    public async Task<ArticleResponse?> GetArticleAsync(string slug)
    {
        var article = await GetArticleByTypeAsync(ArticleType.Slug, slug);
        return article.FirstOrDefault();
    }
    
    public async Task<List<ArticleResponse>?> GetArticleByAuthorAsync(string authorName) => await GetArticleByTypeAsync(ArticleType.Author, authorName);
    
    public async Task<List<ArticleResponse>?> GetArticleByTagAsync(string tag) => await GetArticleByTypeAsync(ArticleType.Tag, tag);
    
    public async Task<ResultDto<List<ArticleResponse>>> GetArticleByFavorites(string author)
    {
        var result = new ResultDto<List<ArticleResponse>>
        {
            Value = await GetArticleByTypeAsync(ArticleType.AuthorFavorites, author)
        };
        return result;
    }

    public async Task<ResultDto<ArticleResponse>> FavoriteArticle(string slug)
    {
        var result = new ResultDto<ArticleResponse>();
        var article = await _ctx.Articles.FirstOrDefaultAsync(x => x.Slug == slug);
        if (article is not null)
        {
            try
            {
                var userFavorite = new UserFavorite
                {
                    ArticleId = article.ArticleId,
                    UserId = _currentUserService.UserId
                };
                await _ctx.UserFavorites.AddAsync(userFavorite);
                article.FavoritesCount += 1;
                var res = await _ctx.SaveChangesAsync();
                if (res > 0)
                {
                    var art = await GetArticleByTypeAsync(ArticleType.Slug, article.Slug!);
                    result.Value = _mapper.Map<ArticleResponse>(art.First());
                }
            }
            catch (Exception e)
            {
                result.Errors = new List<ErrorDto> { new() { Message = e.Message }};
            }
        }
        else
            result.Errors = new List<ErrorDto> { new() {Message = $"Could not find article with slug: {slug}"}};
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
                    article.FavoritesCount -= 1;
                    await _ctx.SaveChangesAsync();
                }
                else
                    result.Errors = new List<ErrorDto>
                        {new() {Message = $"No article favorited found with slug: {slug}"}};
            }
            else
                result.Errors = new List<ErrorDto> {new() {Message = $"No article found with slug: {slug}"}};
        }
        catch (Exception e)
        {
            result.Errors = new List<ErrorDto> {new() {Message = e.Message}};
        }
        return result;
    }

    public async Task<List<ArticleResponse>> GetArticleByTypeAsync(ArticleType type,string value)
    {
        var articles = type switch
        {
            ArticleType.Author => await GetArticlesByAuthorOrSlug(ArticleType.Author,value),
            ArticleType.Slug => await GetArticlesByAuthorOrSlug(ArticleType.Slug,value),
            ArticleType.All => await GetArticlesByAuthorOrSlug(ArticleType.All,string.Empty),
            ArticleType.Tag => await _ctx.ArticleTags.AsNoTracking().Where(x => x.Tag!.Text == value)
            .Select(a => new Article
            {
                Author = a.Article!.Author,
                Slug = a.Article.Slug,
                Title = a.Article.Title,
                Description = a.Article.Description,
                Body = a.Article.Body,
                CreatedAt = a.Article.CreatedAt,
                UpdatedAt = a.Article.UpdatedAt,
                FavoritesCount = a.Article.FavoritesCount,
                TagsArray = a.Article.Tags.Select(x=>x.Tag!.Text).ToArray(),
                IsFollowing = _ctx.UserFollowers.Any(x => x.FollowerId == _currentUserService.UserId && x.UserId == a.Article.Author!.Id)
            }).OrderByDescending(x=>x.CreatedAt).ToListAsync(),
            _ => new List<Article>()
        };

        if (type == ArticleType.AuthorFavorites)
        {
            var user = await _ctx.Users.AsNoTracking().AnyAsync(x => x.UserName == value);
            if (user)
            {
                articles = await _ctx.UserFavorites.Where(x => x.UserId == x.User!.Id)
                .Select(a => new Article
                {
                    Author = a.Article!.Author,
                    Slug = a.Article.Slug,
                    Title = a.Article.Title,
                    Description = a.Article.Description,
                    Body = a.Article.Body,
                    CreatedAt = a.Article.CreatedAt,
                    UpdatedAt = a.Article.UpdatedAt,
                    FavoritesCount = a.Article.FavoritesCount,
                    TagsArray = a.Article.Tags.Select(x=>x.Tag!.Text).ToArray(),
                    IsFollowing = _ctx.UserFollowers.Any(x => x.FollowerId == _currentUserService.UserId && x.UserId == a.Article.Author!.Id)
                }).OrderByDescending(x=>x.CreatedAt).ToListAsync();
            }
        }


        return !articles.Any() ? Enumerable.Empty<ArticleResponse>().ToList() : articles
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
        return await _ctx.Articles.AsNoTracking()
            .Where(x => type == ArticleType.Slug ? x.Slug == value :
                type != ArticleType.Author || x.Author!.UserName == value)
            .Select(a => new Article
            {
                Author = a.Author,
                Slug = a.Slug,
                Title = a.Title,
                Description = a.Description,
                Body = a.Body,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt,
                FavoritesCount = a.FavoritesCount,
                TagsArray = a.Tags.Select(x => x.Tag!.Text).ToArray(),
                IsFollowing = _ctx.UserFollowers.Any(x =>
                    x.FollowerId == _currentUserService.UserId && x.UserId == a.Author!.Id)
            }).OrderByDescending(x => x.CreatedAt).ToListAsync();
    }

    public async Task<ResultDto<ArticleResponse>> CreateArticleAsync(CreateArticle article)
    {
        var result = new ResultDto<ArticleResponse>();
        var tags = new List<ArticleTags>();
        try
        {
            var articleToCreate = _mapper.Map<Article>(article);
            articleToCreate.AuthorId = _currentUserService.UserId;
            articleToCreate.ArticleId = Guid.NewGuid().ToString();
            articleToCreate.Slug = articleToCreate.Title!.Slugify();
            
            if (article.Tags.Length > 0)
            {
                foreach (var articleTag in article.Tags)
                {
                    var tag = await _ctx.Tags.Where(x => x.Text == articleTag)
                        .Select(x => new
                        {
                            Id = x.TagId
                        }).FirstOrDefaultAsync();
                    if (tag is null)
                    {
                        var tagId = await _tagService.CreateTagAsync(articleTag);
                        if (tagId != string.Empty)
                            tags.Add(new ArticleTags {TagId = tagId, ArticleId = articleToCreate.ArticleId});
                        else
                            result.Errors = new List<ErrorDto> {new() {Message = "Error while creating tags!"}};
                    }
                    else
                        tags.Add(new ArticleTags {TagId = tag!.Id, ArticleId = articleToCreate.ArticleId});
                } 
            }
            await _ctx.Articles.AddAsync(articleToCreate);
            await _ctx.ArticleTags.AddRangeAsync(tags);
            var res = await _ctx.SaveChangesAsync();
            if (res > 0)
            {
                var response = await GetArticleByTypeAsync(ArticleType.Slug,articleToCreate.Slug!);
                result.Value = response.First();
            }
        }
        catch (Exception e)
        {
            result.Errors = new List<ErrorDto>{ new() { Message = e.Message }};
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
                if (res > 0) result.Value = $"Article: {slug} Deleted Successfully";
            }
            catch (Exception e)
            {
                result.Errors = new List<ErrorDto> {new() {Message = e.Message}};
            }
        }
        else
            result.Errors = new List<ErrorDto> {new() {Message = $"No article found with slug: {slug}"}};

        return result;
    }

    public Task<ArticleResponse> UpdateArticleAsync(Guid id, UpdateArticle updatedArticle)
    {
        throw new NotImplementedException();
    }
}