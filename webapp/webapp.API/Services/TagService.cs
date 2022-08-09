using Microsoft.EntityFrameworkCore;
using webapp.API.Data;
using webapp.API.Interfaces;
using webapp.API.Models;

namespace webapp.API.Services;

public class TagService : ITagService
{
    private readonly AppDbContext _ctx;

    public TagService(AppDbContext ctx) => _ctx = ctx;

    public async Task<bool> CreateTagAsync(string tag)
    {
        var tagToCreate = new Tag
        {
            Text = tag
        };
        await _ctx.Tags.AddAsync(tagToCreate);
        return await _ctx.SaveChangesAsync() > 0;
    }

    public async Task<List<Tag>> GetAllTagsAsync() => await _ctx.Tags.AsNoTracking().ToListAsync();

    public async Task<bool> TagExists(string tagName)
    {
        var result = await _ctx.Tags.AsNoTracking().FirstOrDefaultAsync(x => x.Text == tagName);
        return result != null;
    }
}