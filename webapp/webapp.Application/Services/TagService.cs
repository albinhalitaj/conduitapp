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
        int result;
        var tagToCreate = new Tag
        {
            TagId = Guid.NewGuid().ToString(),
            Text = tag
        };
        try
        {
            await _ctx.Tags.AddAsync(tagToCreate);
            result = await _ctx.SaveChangesAsync();
        }
        catch (Exception e)
        {
            return e.Message;
        }

        return result > 0 ? tagToCreate.TagId : string.Empty;
    }

    public async Task<ResultDto<string[]>> GetAllTagsAsync()
    {
        var result = new ResultDto<string[]>();
        var tags = await _ctx.Tags.Select(x => x.Text).ToArrayAsync();
        if (tags.Length == 0)
        {
            result.Value = Array.Empty<string>();
            return result;
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