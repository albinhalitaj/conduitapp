using Microsoft.AspNetCore.Mvc;
using webapp.API.ApiExtensions;
using webapp.API.DTOs;
using webapp.API.Interfaces;

namespace webapp.API.Controllers;

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
    public async Task<IActionResult> GetArticles()
    {
        var response = new ResultDto<List<ArticleResponse>>();
        var result = await _articleService.GetAllArticlesAsync();
        response.Value = result;
        return Ok(response);
    }

    [HttpGet, Route("{slug}")]
    public async Task<IActionResult> GetArticle([FromRoute] string slug)
    {
        var response = new ResultDto<ArticleResponse>();
        var result = await _articleService.GetArticleAsync(slug);
        if (result is null)
        {
            response.Errors = new List<ErrorDto>
                {new() {Message = $"No articles found with slug {slug}", ErrorCode = "NotFound"}};
            return NotFound(response);
        }
        response.Value = result;
        return Ok(response);
    }
    
    [HttpGet,Route("byAuthor")]
    public async Task<IActionResult> GetArticleByAuthor([FromQuery] string author)
    {
        var response = new ResultDto<List<ArticleResponse>>();
        var result = await _articleService.GetArticleByAuthorAsync(author);
        if (result == null)
        {
            response.Errors = new List<ErrorDto> {new() {Message = $"No articles found with author {author}",ErrorCode = "NotFound"}};
            return NotFound(response);
        }
        response.Value = result;
        return Ok(response);
    }
    
    [HttpGet,Route("byTag")]
    public async Task<IActionResult> GetArticleByTag([FromQuery] string tag)
    {
        var response = new ResultDto<List<ArticleResponse>>();
        var result = await _articleService.GetArticleByTagAsync(tag);
        if (result == null)
        {
            response.Errors = new List<ErrorDto> {new() {Message = $"No articles found with tag {tag}",ErrorCode = "NotFound"}};
            return NotFound(response);
        }
        response.Value = result;
        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> CreateArticle([FromBody] CreateArticle request)
    {
        var result = await _articleService.CreateArticleAsync(request);
        if (result.Success)
            return Ok(result);
        return BadRequest(result);
    }
    
    [HttpPost,Route("{slug}/favorite")]
    public async Task<IActionResult> FavoriteArticle([FromRoute] string slug)
    {
        var result = await _articleService.FavoriteArticle(slug);
        if (result.Success)
            return Ok(result);
        return BadRequest(result);
    }
    
    [HttpDelete,Route("{slug}/favorite")]
    public async Task<IActionResult> UnFavoriteArticle([FromRoute] string slug)
    {
        var result = await _articleService.UnFavoriteArticle(slug);
        if (result.Success)
            return Ok(result);
        return BadRequest(result);
    }
    
    [HttpGet, Route("byFavorite")]
    public async Task<IActionResult> GetArticleByFavorite([FromQuery] string author)
    {
        var result = await _articleService.GetArticleByFavorites(author);
        if (result.Success)
            return Ok(result);
        return BadRequest(result);
    }


    [HttpPost, Route("{slug}/comments")]
    public async Task<IActionResult> CreateComment([FromRoute] string slug,CreateCommentRequest request)
    {
        var result = await _commentService.CreateComment(slug,request);
        if (result.Success)
            return Ok(result);
        return BadRequest(result);
    }
    
    [HttpGet, Route("{slug}/comments")]
    public async Task<IActionResult> ListComments([FromRoute] string slug)
    {
        var result = await _commentService.ListComments(slug);
        if (result.Success)
            return Ok(result);
        return BadRequest(result);
    }
    
    [HttpDelete,Route("{slug}/comments/{id}")]
    public async Task<IActionResult> DeleteComment([FromRoute] string slug,[FromRoute] string id)
    {
        var result = await _commentService.DeleteCommentAsync(slug,id);
        return Ok(result);
    }
    
    [HttpDelete,Route("{slug}")]
    public async Task<IActionResult> DeleteArticle([FromRoute] string slug)
    {
        var result = await _articleService.DeleteArticleAsync(slug);
        if (result.Success)
            return NoContent();
        return BadRequest(result);
    }
}
