using AutoFixture;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Shouldly;
using webapp.API.Controllers.V1;
using webapp.Application.Interfaces;
using webapp.Contracts.Articles;
using webapp.Contracts.Common;

namespace webapp.APITests.Controllers.V1;

public class ArticlesControllerTests
{
    private readonly IFixture _fixture = new Fixture();
    private readonly Mock<IArticleService> _articleService;
    private readonly Mock<ICommentService> _commentService;

    public ArticlesControllerTests()
    {
        _articleService = new Mock<IArticleService>();
        _commentService = new Mock<ICommentService>();
    }

    [Fact]
    public async Task GetArticles_ReturnsOk()
    {
        var queryParams = _fixture.Create<QueryParams>();
        var articles = _fixture.CreateMany<ArticleResponse>(5).ToList();
        _articleService.Setup(x => x.GetAllArticlesAsync(queryParams))
            .ReturnsAsync(new ResultDto<List<ArticleResponse>>{Value = articles});
        var controller = new ArticlesController(_articleService.Object, _commentService.Object);

        var result = await controller.GetArticles(queryParams).ConfigureAwait(false);

        result.ShouldBeOfType<OkObjectResult>();
        result.ShouldBeAssignableTo<ActionResult>();
    }

    [Fact]
    public async Task GetArticles_ReturnsProblem_WhenError()
    {
        var queryParams = _fixture.Create<QueryParams>();
        _articleService.Setup(x => x.GetAllArticlesAsync(queryParams))
            .ReturnsAsync(new ResultDto<List<ArticleResponse>>{Errors = new List<ErrorDto>{new(){Message = "someerror"}}});

        var controller = new ArticlesController(_articleService.Object, _commentService.Object);

        var result = await controller.GetArticles(queryParams).ConfigureAwait(false);

        result.ShouldBeOfType<ObjectResult>()
            .Value.ShouldBeOfType<ProblemDetails>();
        result.ShouldBeAssignableTo<ActionResult>();
    }

    [Fact]
    public async Task GetArticle_ReturnsArticle_WhenArticleFound()
    {
        var articleSlug = _fixture.Create<string>();
        var article = _fixture.Create<ArticleResponse>();
        _articleService.Setup(x => x.GetArticleAsync(articleSlug))
            .ReturnsAsync(new ResultDto<ArticleResponse> { Value = article });

        var controller = new ArticlesController(_articleService.Object, _commentService.Object);

        var result = await controller.GetArticle(articleSlug).ConfigureAwait(false);
        
        result.ShouldNotBe(null);
        result.ShouldBeOfType<OkObjectResult>()
            .Value.ShouldBeOfType<ArticleResponse>();
    }

    [Fact]
    public async Task GetArticle_ReturnsProblem_WhenArticleNotFound()
    {
        var articleSlug = _fixture.Create<string>();
        _articleService.Setup(x => x.GetArticleAsync(articleSlug))
            .ReturnsAsync(new ResultDto<ArticleResponse> { Errors = new List<ErrorDto>
            {
                new() {Message = $"Article with slug {articleSlug} was not found!"}
            } });

        var controller = new ArticlesController(_articleService.Object, _commentService.Object);

        var result = await controller.GetArticle(articleSlug).ConfigureAwait(false);

        result.ShouldBeAssignableTo<ActionResult>();
        result.ShouldBeOfType<ObjectResult>()
            .Value.ShouldBeOfType<ProblemDetails>()
            .Title.ShouldBe($"Article with slug {articleSlug} was not found!");
    }
}