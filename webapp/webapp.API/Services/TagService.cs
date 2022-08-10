using Microsoft.EntityFrameworkCore;
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

    public async Task<List<Tag>> GetAllTagsAsync() => await _ctx.Tags.AsNoTracking().ToListAsync();

    public async Task<bool> TagExists(string tagName)
    {
        var result = await _ctx.Tags.AsNoTracking().FirstOrDefaultAsync(x => x.Text == tagName);
        return result != null;
    }
}