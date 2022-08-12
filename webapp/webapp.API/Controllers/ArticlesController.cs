using Microsoft.AspNetCore.Mvc;
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
        var result = await _articleService.GetAllArticlesAsync();
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet, Route("{slug}")]
    public async Task<IActionResult> GetArticle([FromRoute] string slug)
    {
        var result = await _articleService.GetArticleAsync(slug);
        return result.Success ? Ok(result) : BadRequest(result);
    }
    
    [HttpGet,Route("byAuthor")]
    public async Task<IActionResult> GetArticleByAuthor([FromQuery] string author)
    {
        var result = await _articleService.GetArticleByAuthorAsync(author);
        return result.Success ? Ok(result) : BadRequest(result);
    }
    
    [HttpGet,Route("byTag")]
    public async Task<IActionResult> GetArticleByTag([FromQuery] string tag)
    {
        var result = await _articleService.GetArticleByTagAsync(tag);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateArticle([FromBody] CreateArticle request)
    {
        var result = await _articleService.CreateArticleAsync(request);
        return result.Success ? Ok(result) : BadRequest(result);
    }
    
    [HttpPost,Route("{slug}/favorite")]
    public async Task<IActionResult> FavoriteArticle([FromRoute] string slug)
    {
        var result = await _articleService.FavoriteArticle(slug);
        return result.Success ? Ok(result) : BadRequest(result);
    }
    
    [HttpDelete,Route("{slug}/favorite")]
    public async Task<IActionResult> UnFavoriteArticle([FromRoute] string slug)
    {
        var result = await _articleService.UnFavoriteArticle(slug);
        return result.Success ? Ok(result) : BadRequest(result);
    }
    
    [HttpGet, Route("byFavorite")]
    public async Task<IActionResult> GetArticleByFavorite([FromQuery] string author)
    {
        var result = await _articleService.GetArticleByFavorites(author);
        return result.Success ? Ok(result) : BadRequest(result);
    }


    [HttpPost, Route("{slug}/comments")]
    public async Task<IActionResult> CreateComment([FromRoute] string slug,CreateCommentRequest request)
    {
        var result = await _commentService.CreateComment(slug,request);
        return result.Success ? Ok(result) : BadRequest(result);
    }
    
    [HttpGet, Route("{slug}/comments")]
    public async Task<IActionResult> ListComments([FromRoute] string slug)
    {
        var result = await _commentService.ListComments(slug);
        return result.Success ? Ok(result) : BadRequest(result);
    }
    
    [HttpDelete,Route("{slug}/comments/{id}")]
    public async Task<IActionResult> DeleteComment([FromRoute] string slug,[FromRoute] string id)
    {
        var result = await _commentService.DeleteCommentAsync(slug,id);
        return result.Success ? Ok(result) : BadRequest(result);
    }
    
    [HttpDelete,Route("{slug}")]
    public async Task<IActionResult> DeleteArticle([FromRoute] string slug)
    {
        var result = await _articleService.DeleteArticleAsync(slug);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
