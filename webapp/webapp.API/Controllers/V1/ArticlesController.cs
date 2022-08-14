using Microsoft.AspNetCore.Mvc;
using webapp.API.DTOs;
using webapp.API.Interfaces;

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
    public async Task<IActionResult> GetArticles([FromQuery] QueryParams queryParams)
    {
        var result = await _articleService.GetAllArticlesAsync(queryParams);
        return result.Success ? Ok(result.Value) : Problem(result.Errors);
    }

    [HttpGet, Route("{slug}")]
    public async Task<IActionResult> GetArticle([FromRoute] string slug)
    {
        var result = await _articleService.GetArticleAsync(slug);
        return result.Success ? Ok(result.Value) : Problem(result.Errors);
    }

    [HttpGet, Route("feed")]
    public async Task<IActionResult> Feed([FromQuery] QueryParams queryParams)
    {
        var result = await _articleService.Feed(queryParams);
        return result.Success ? Ok(result.Value) : Problem(result.Errors);
    }

    [HttpGet,Route("byAuthor")]
    public async Task<IActionResult> GetArticleByAuthor([FromQuery] string author)
    {
        var result = await _articleService.GetArticleByAuthorAsync(author);
        return result.Success ? Ok(result.Value) : Problem(result.Errors);
    }

    [HttpGet,Route("byTag")]
    public async Task<IActionResult> GetArticleByTag([FromQuery] string tag)
    {
        var result = await _articleService.GetArticleByTagAsync(tag);
        return result.Success ? Ok(result.Value) : Problem(result.Errors);
    }

    [HttpPost]
    public async Task<IActionResult> CreateArticle([FromBody] CreateArticleRequest request)
    {
        var result = await _articleService.CreateArticleAsync(request);
        return result.Success ? Ok(result.Value) : Problem(result.Errors);
    }

    [HttpPut, Route("{slug}")]
    public async Task<IActionResult> UpdateArticle([FromRoute] string slug,UpdateArticleRequest request)
    {
        var response = await _articleService.UpdateArticleAsync(slug, request);
        return response.Success ? Ok(response.Value) : Problem(response.Errors);
    }

    [HttpPost,Route("{slug}/favorite")]
    public async Task<IActionResult> FavoriteArticle([FromRoute] string slug)
    {
        var result = await _articleService.FavoriteArticle(slug);
        return result.Success ? Ok(result.Value) : Problem(result.Errors);
    }

    [HttpDelete,Route("{slug}/favorite")]
    public async Task<IActionResult> UnFavoriteArticle([FromRoute] string slug)
    {
        var result = await _articleService.UnFavoriteArticle(slug);
        return result.Success ? Ok(result.Value) : Problem(result.Errors);
    }

    [HttpGet, Route("byFavorite")]
    public async Task<IActionResult> GetArticleByFavorite([FromQuery] string author)
    {
        var result = await _articleService.GetArticleByFavorites(author);
        return result.Success ? Ok(result.Value) : Problem(result.Errors);
    }


    [HttpPost, Route("{slug}/comments")]
    public async Task<IActionResult> CreateComment([FromRoute] string slug,CreateCommentRequest request)
    {
        var result = await _commentService.CreateComment(slug,request);
        return result.Success ? Ok(result.Value) : Problem(result.Errors);
    }

    [HttpGet, Route("{slug}/comments")]
    public async Task<IActionResult> ListComments([FromRoute] string slug)
    {
        var result = await _commentService.ListComments(slug);
        return result.Success ? Ok(result.Value) : Problem(result.Errors);
    }

    [HttpDelete,Route("{slug}/comments/{id}")]
    public async Task<IActionResult> DeleteComment([FromRoute] string slug,[FromRoute] string id)
    {
        var result = await _commentService.DeleteCommentAsync(slug,id);
        return result.Success ? Ok(result.Value) : Problem(result.Errors);
    }

    [HttpDelete,Route("{slug}")]
    public async Task<IActionResult> DeleteArticle([FromRoute] string slug)
    {
        var result = await _articleService.DeleteArticleAsync(slug);
        return result.Success ? Ok(result.Value) : Problem(result.Errors);
    }
}

public record QueryParams(int Limit, int Offset);
