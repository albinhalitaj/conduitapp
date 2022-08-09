using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using webapp.API.ApiExtensions;
using webapp.API.Interfaces;

namespace webapp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class TagsController : ControllerBase
{
    private readonly ITagService _tagService;

    public TagsController(ITagService tagService)
    {
        _tagService = tagService;
    }

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