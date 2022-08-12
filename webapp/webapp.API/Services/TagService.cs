using Microsoft.EntityFrameworkCore;
using webapp.API.ApiExtensions;
using webapp.API.Data;
using webapp.API.Interfaces;
using webapp.API.Models;

namespace webapp.API.Services;

public class TagService : ITagService
{
    private readonly AppDbContext _ctx;

    public TagService(AppDbContext ctx) => _ctx = ctx;

    public async Task<string> CreateTagAsync(string tag)
    {
        var tagToCreate = new Tag
        {
            TagId = Guid.NewGuid().ToString(),
            Text = tag
        };
        await _ctx.Tags.AddAsync(tagToCreate);
        var result = await _ctx.SaveChangesAsync();

        return result > 0 ? tagToCreate.TagId : string.Empty;
    }

    public async Task<ResultDto<List<Tag>>> GetAllTagsAsync()
    {
        return new ResultDto<List<Tag>>
        {
            Value = await _ctx.Tags.AsNoTracking().Select(x => new Tag
            {
                Text = x.Text
            }).ToListAsync()
        };
    }
}