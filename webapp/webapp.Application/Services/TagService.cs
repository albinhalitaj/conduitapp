using Microsoft.EntityFrameworkCore;
using webapp.Application.Interfaces;
using webapp.Contracts.Common;
using webapp.Domain.Entities;

namespace webapp.Application.Services;

public class TagService : ITagService
{
    private readonly IAppDbContext _ctx;

    public TagService(IAppDbContext ctx) => _ctx = ctx;

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

    public async Task<ResultDto<string[]>> GetAllTagsAsync()
    {
        var result = new ResultDto<string[]>();
        var tags = await _ctx.Tags.Select(x => x.Text).ToArrayAsync();
        if (tags.Length == 0)
        {
            result.Value = Array.Empty<string>();
        }
        result.Value = tags!;
        return result;
    }

    public async Task<string?> CheckIfExists(string tagName)
    {
        var tag = await _ctx.Tags.Where(x => x.Text == tagName)
            .Select(x => new
            {
                Id = x.TagId
            }).FirstOrDefaultAsync();
        return tag?.Id;
    }
}