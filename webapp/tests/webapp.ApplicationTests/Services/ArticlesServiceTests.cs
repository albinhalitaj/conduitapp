using AutoFixture;
using Moq;
using Shouldly;
using webapp.Application.Interfaces;
using webapp.Contracts.Articles;
using webapp.Contracts.Authors;
using webapp.Contracts.Common;

namespace webapp.ApplicationTests.Services;

public class ArticlesServiceTests
{
    private readonly IFixture _fixture = new Fixture();
    private readonly Mock<IArticleService> _articleService;

    public ArticlesServiceTests()
    {
        _articleService = _fixture.Freeze<Mock<IArticleService>>();
    }

    [Fact]
    public async Task GetAllArticles_ReturnsArticles()
    {
        var queryParams = _fixture.Create<QueryParams>();
        var articles = _fixture.Create<List<ArticleResponse>>();
        _articleService.Setup(x => x.GetAllArticlesAsync(queryParams))
           .ReturnsAsync(new ResultDto<List<ArticleResponse>> { Value = articles });

        var result = await _articleService.Object.GetAllArticlesAsync(queryParams).ConfigureAwait(false);

        result.ShouldBeOfType<ResultDto<List<ArticleResponse>>>();
        result.ShouldNotBe(null);
        result.Value?.Count.ShouldBe(articles.Count);
        result.Success.ShouldBe(true);
    }

    [Fact]
    public async Task Feed_ShouldReturn_ListOfArticles_WhenFound()
    {
        var queryParams = _fixture.Create<QueryParams>();
        var articles = _fixture.Create<List<ArticleResponse>>();
        _articleService.Setup(x => x.Feed(queryParams))
           .ReturnsAsync(new ResultDto<List<ArticleResponse>> { Value = articles });

        var result = await _articleService.Object.Feed(queryParams).ConfigureAwait(false);

        result.ShouldBeOfType<ResultDto<List<ArticleResponse>>>();
        result.ShouldNotBe(null);
        result.Value?.Count.ShouldBe(articles.Count);
        result.Success.ShouldBe(true);
    }

    [Fact]
    public async Task Feed_ShouldSkipAndTake_BasedOnQueryParams()
    {
        var queryParams = new QueryParams(5, 1);
        var articles = _fixture.CreateMany<ArticleResponse>(5).ToList();
        _articleService.Setup(x => x.Feed(queryParams))
           .ReturnsAsync(new ResultDto<List<ArticleResponse>> { Value = articles });

        var result = await _articleService.Object.Feed(queryParams).ConfigureAwait(false);

        result.ShouldBeOfType<ResultDto<List<ArticleResponse>>>();
        result.ShouldNotBe(null);
        result.Value?.Count.ShouldBe(queryParams.Limit);
        result.Success.ShouldBe(true);
    }

    [Fact]
    public async Task GetArticle_ReturnsSingleArticle_WhenFound()
    {
        var article = _fixture.Create<ArticleResponse>();
        _articleService.Setup(x => x.GetArticleAsync(article.Slug ?? string.Empty))
           .ReturnsAsync(new ResultDto<ArticleResponse> { Value = article });

        var result = await _articleService.Object.GetArticleAsync(article.Slug ?? string.Empty);

        result.ShouldBeOfType<ResultDto<ArticleResponse>>();
        result.ShouldNotBe(null);
        result.Value?.Slug?.ShouldBe(article.Slug);
        result.Success.ShouldBe(true);
    }

    [Fact]
    public async Task GetArticle_ReturnsNotFound_WhenArticleNotFound()
    {
        var slug = _fixture.Create<string>();
        _articleService.Setup(x => x.GetArticleAsync(slug))
           .ReturnsAsync(new ResultDto<ArticleResponse> { Errors = new List<ErrorDto> { new() { Message = "Article with slug " + slug + " was not found!" } } });

        var result = await _articleService.Object.GetArticleAsync(slug);

        result.ShouldBeOfType<ResultDto<ArticleResponse>>();
        result.Errors.FirstOrDefault()?.Message?.ShouldMatch($"Article with slug {slug} was not found!");
        result.Success.ShouldBe(false);
    }

    [Fact]
    public async Task GetArticleByAuthor_ReturnsArticles_WhenFound()
    {
        var author = new Author("albikk", "Albin's Bio", null, false);
        _fixture.Customize<ArticleResponse>(a => a.With(x => x.Author, author));

        var article = _fixture.CreateMany<ArticleResponse>(2).ToList();
        _articleService.Setup(x => x.GetArticleByAuthorAsync(author.Username))
           .ReturnsAsync(new ResultDto<List<ArticleResponse>> { Value = article });

        var result = await _articleService.Object.GetArticleByAuthorAsync(author.Username);

        result.ShouldBeOfType<ResultDto<List<ArticleResponse>>>();
        result.Success.ShouldBe(true);
        var any = result.Value?.All(x => x.Author.Username == author.Username);
        any.ShouldBe(true);
    }

    [Fact]
    public async Task GetArticleByTag_ReturnsArticles_WhenFound()
    {
        const string tag = "dotnet";
        _fixture.Customize<ArticleResponse>(a =>
           a.With(x => x.Tags, new[] { tag }));

        var article = _fixture.CreateMany<ArticleResponse>(2).ToList();
        _articleService.Setup(x => x.GetArticleByTagAsync(tag))
           .ReturnsAsync(new ResultDto<List<ArticleResponse>> { Value = article });

        var result = await _articleService.Object.GetArticleByTagAsync(tag);

        result.ShouldBeOfType<ResultDto<List<ArticleResponse>>>();
        result.Success.ShouldBe(true);
        var any = result.Value?.All(x => {
            var contains = x.Tags?.Contains(tag);
            return contains is not null;
        });
        any.ShouldBe(true);
    }

    [Fact]
    public async Task GetArticleByFavorites_ReturnsArticles_WhenFound()
    {
        var author = new Author("albikk", "Albin's Bio", null, false);
        _fixture.Customize<ArticleResponse>(a =>
           a.With(x => x.Author, author));

        var article = _fixture.CreateMany<ArticleResponse>(2).ToList();
        _articleService.Setup(x => x.GetArticleByFavorites(author.Username))
           .ReturnsAsync(new ResultDto<List<ArticleResponse>> { Value = article });

        var result = await _articleService.Object.GetArticleByFavorites(author.Username);

        result.ShouldBeOfType<ResultDto<List<ArticleResponse>>>();
        result.Success.ShouldBe(true);
        var any = result.Value?.All(x => x.Author.Username == author.Username);
        any.ShouldBe(true);
    }

    [Fact]
    public async Task FavoriteArticle_ShouldAddFavoriteRecord_WhenArticleFound()
    {
        var slug = _fixture.Create<string>();
        _fixture.Customize<ArticleResponse>(a =>
           a.With(x => x.Slug, slug)
              .With(x => x.FavoritesCount, 1));

        var article = _fixture.Create<ArticleResponse>();
        _articleService.Setup(x => x.FavoriteArticle(slug))
           .ReturnsAsync(new ResultDto<ArticleResponse> { Value = article });

        var result = await _articleService.Object.FavoriteArticle(slug);

        result.ShouldBeOfType<ResultDto<ArticleResponse>>();
        result.Success.ShouldBe(true);
        result.Value?.Slug?.ShouldMatch(slug);
        result.Value?.FavoritesCount.ShouldBe(1);
    }

    [Fact]
    public async Task FavoriteArticle_ReturnsNotFound_WhenArticleNotFound()
    {
        var slug = _fixture.Create<string>();
        _fixture.Customize<ArticleResponse>(a =>
           a.With(x => x.Slug, slug)
              .With(x => x.FavoritesCount, 1));

        _articleService.Setup(x => x.FavoriteArticle(slug))
           .ReturnsAsync(new ResultDto<ArticleResponse> { Errors = new List<ErrorDto> { new() { Message = $"Could not find article with slug: {slug}" } } });

        var result = await _articleService.Object.FavoriteArticle(slug);

        result.ShouldBeOfType<ResultDto<ArticleResponse>>();
        result.Success.ShouldBe(false);
        result.Errors.FirstOrDefault()!.Message.ShouldBe("Could not find article with slug: " + slug);
    }
}
