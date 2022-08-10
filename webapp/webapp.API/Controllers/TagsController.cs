using Microsoft.AspNetCore.Mvc;
using webapp.API.ApiExtensions;
using webapp.API.Interfaces;

namespace webapp.API.Controllers;

public class TagsController : ApiController
{
    private readonly ITagService _tagService;

    public TagsController(ITagService tagService) => _tagService = tagService;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var response = new ResultDto<string[]>();
        var tags = await _tagService.GetAllTagsAsync();
        var tagsResponse = tags.Select(tag => tag.Text).ToArray();
        response.Value = tagsResponse!; 
        return Ok(response);
    }
}