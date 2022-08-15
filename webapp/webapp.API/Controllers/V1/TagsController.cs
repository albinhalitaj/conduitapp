using Microsoft.AspNetCore.Mvc;
using webapp.Application.Interfaces;

namespace webapp.API.Controllers.V1;

public class TagsController : ApiController
{
    private readonly ITagService _tagService;

    public TagsController(ITagService tagService) => _tagService = tagService;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var response = await _tagService.GetAllTagsAsync();
        return response.Success ? Ok(response) : Problem(response.Errors);
    }
}