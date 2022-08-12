using Microsoft.AspNetCore.Mvc;
using webapp.API.Interfaces;

namespace webapp.API.Controllers;

public class TagsController : ApiController
{
    private readonly ITagService _tagService;

    public TagsController(ITagService tagService) => _tagService = tagService;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var response = await _tagService.GetAllTagsAsync();
        return response.Success ? Ok(response) : BadRequest(response);
    }
}