using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using webapp.Application.Interfaces;
using webapp.Contracts.Articles;
using webapp.Contracts.Comments;
using webapp.Contracts.Common;

namespace webapp.API.Controllers.V1;

public class ArticlesController : ApiController
{
    private readonly IArticleService _articleService;
    private readonly ICommentService _commentService;

    public ArticlesController(IArticleService articleService, ICommentService commentService)
    {
        _articleService = articleService;
        _commentService = commentService;
    }

    [HttpGet]
    [SwaggerResponse(StatusCodes.Status401Unauthorized)]
    [SwaggerResponse(StatusCodes.Status200OK, "Returns a list of articles", typeof(ArticleResponse))]
    [SwaggerResponse(StatusCodes.Status400BadRequest, "Returns an error", typeof(ProblemDetails))]
    [Produces("application/json")]
    public async Task<IActionResult> GetArticles([FromQuery] QueryParams queryParams)
    {
        var result = await _articleService.GetAllArticlesAsync(queryParams);
        return !result.Success
            ? Problem(result.Errors)
            : Ok(new
            {
                Articles = result.Value,
                ArticlesCount = result.Value!.Any() ? result.Value!.Count : 0
            });
    }

    [HttpGet("{slug}")]
    [SwaggerResponse(StatusCodes.Status401Unauthorized)]
    [SwaggerResponse(StatusCodes.Status200OK, "Returns an article", typeof(ArticleResponse))]
    [SwaggerResponse(StatusCodes.Status404NotFound, "Returns an error", typeof(ProblemDetails))]
    [SwaggerResponse(StatusCodes.Status400BadRequest, "Returns an error", typeof(ProblemDetails))]
    public async Task<IActionResult> GetArticle([FromRoute] string slug)
    {
        var result = await _articleService.GetArticleAsync(slug);
        return result.Success ? Ok(new
        {
            Article = result.Value
        }) : Problem(result.Errors);
    }

    [HttpGet("feed")]
    public async Task<IActionResult> Feed([FromQuery] QueryParams queryParams)
    {
        var result = await _articleService.Feed(queryParams);
        return !result.Success ? Problem(result.Errors) : Ok(new
            {
                Articles = result.Value,
                ArticlesCount = result.Value!.Any() ? result.Value!.Count : 0
            });
    }

    [HttpGet("byAuthor")]
    public async Task<IActionResult> GetArticleByAuthor([FromQuery] string author)
    {
        var result = await _articleService.GetArticleByAuthorAsync(author);
        return !result.Success ? Problem(result.Errors) : Ok(new
            {
                Articles = result.Value,
                ArticlesCount = result.Value!.Any() ? result.Value!.Count : 0
            });
    }

    [HttpGet("byTag")]
    public async Task<IActionResult> GetArticleByTag([FromQuery] string tag)
    {
        var result = await _articleService.GetArticleByTagAsync(tag);
        return !result.Success
            ? Problem(result.Errors)
            : Ok(new
            {
                Articles = result.Value,
                ArticlesCount = result.Value!.Count
            });
    }

    [HttpPost]
    public async Task<IActionResult> CreateArticle([FromBody] CreateArticleRequest request)
    {
        var result = await _articleService.CreateArticleAsync(request);
        return result.Success ? Ok(new
        {
            Article = result.Value
        }) : Problem(result.Errors);
    }

    [HttpPut("{slug}")]
    public async Task<IActionResult> UpdateArticle([FromRoute] string slug,UpdateArticleRequest request)
    {
        var response = await _articleService.UpdateArticleAsync(slug, request);
        return response.Success ? Ok(new
        {
            Article = response.Value
        }) : Problem(response.Errors);
    }

    [HttpPost("{slug}/favorite")]
    public async Task<IActionResult> FavoriteArticle([FromRoute] string slug)
    {
        var result = await _articleService.FavoriteArticle(slug);
        return result.Success ? Ok(new
        {
            Article = result.Value
        }) : Problem(result.Errors);
    }

    [HttpDelete("{slug}/favorite")]
    public async Task<IActionResult> UnFavoriteArticle([FromRoute] string slug)
    {
        var result = await _articleService.UnFavoriteArticle(slug);
        return result.Success ? Ok(new
        {
            Article = result.Value
        }) : Problem(result.Errors);
    }

    [HttpGet("byFavorite")]
    public async Task<IActionResult> GetArticleByFavorite([FromQuery] string author)
    {
        var result = await _articleService.GetArticleByFavorites(author);
        return !result.Success ? Problem(result.Errors) : result.Value!.Count > 1 ? Ok(new
        {
            Articles = result.Value,
            ArticlesCount = result.Value.Count
        }) : Ok(new
        {
            Article = result.Value.First()
        });
    }

    [HttpPost("{slug}/comments")]
    public async Task<IActionResult> CreateComment([FromRoute] string slug,CreateCommentRequest request)
    {
        var result = await _commentService.CreateComment(slug,request);
        return result.Success ? Ok(new
        {
            Comment = result.Value
        }) : Problem(result.Errors);
    }

    [HttpGet("{slug}/comments")]
    public async Task<IActionResult> ListComments([FromRoute] string slug)
    {
        var result = await _commentService.ListComments(slug);
        return !result.Success
            ? Problem(result.Errors)
            : Ok(new
            {
                Comments = result.Value,
            });
    }

    [HttpDelete("{slug}/comments/{id}")]
    public async Task<IActionResult> DeleteComment([FromRoute] string slug,[FromRoute] string id)
    {
        var result = await _commentService.DeleteCommentAsync(slug,id);
        return result.Success ? NoContent() : Problem(result.Errors);
    }

    [HttpDelete("{slug}")]
    public async Task<IActionResult> DeleteArticle([FromRoute] string slug)
    {
        var result = await _articleService.DeleteArticleAsync(slug);
        return result.Success ? NoContent() : Problem(result.Errors);
    }
}