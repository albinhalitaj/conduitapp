using Microsoft.EntityFrameworkCore;
using Shouldly;
using webapp.Application.Interfaces;
using webapp.Application.Services;
using webapp.Infrastructure.Data;

namespace webapp.ApplicationTests.Services;

public class TagServiceTests
{
    private readonly TagService _tagService;
    private readonly IAppDbContext _db;

    public TagServiceTests()
    {
        var dbContextOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("Testing");
        _db = new AppDbContext(dbContextOptions.Options);

        _tagService = new TagService(_db);
    }

    [Fact]
    public async Task CreateTagAsync_ShouldCreateTag_AndReturnTagId()
    {
        const string tag = "This is a simple tag";

        var result = await _tagService.CreateTagAsync(tag).ConfigureAwait(false);
        
        result.ShouldNotBeEmpty();
        result.ShouldBeOfType(typeof(string));
    }

    [Fact]
    public async Task CheckIfExists_ReturnsTagId_IfTagExists()
    {
        const string tag = "sample";
        var result = await _tagService.CreateTagAsync(tag).ConfigureAwait(false);

        var tagId = await _tagService.CheckIfExists(tag).ConfigureAwait(false);

        tagId.ShouldNotBeNull();
        tagId.ShouldBe(result);
    }
    
    [Fact]
    public async Task CheckIfExists_ReturnsNull_IfTagDoesntExist()
    {
        const string tag = "sample";

        var tagId = await _tagService.CheckIfExists(tag).ConfigureAwait(false);

        tagId.ShouldBeNull();
    }

    [Fact]
    public async Task GetAllTagsAsync_ReturnsTags_IfFound()
    {
        await ClearTags();
        
        var tags = new[] { "tag1", "tag2" };
        foreach (var tag in tags)
        {
            await _tagService.CreateTagAsync(tag);
        }

        var result = await _tagService.GetAllTagsAsync().ConfigureAwait(false);

        result.Value.ShouldNotBeNull();
        result.Success.ShouldBeTrue();
        result.Value.ShouldBeOfType(typeof(string[]));
        result.Value.Length.ShouldBe(tags.Length);
        result.Value[0].ShouldBe(tags[0]);
        result.Value[1].ShouldBe(tags[1]);
    }
    
    [Fact]
    public async Task GetAllTagsAsync_ReturnsEmptyArray_IfNotFound()
    {
        await ClearTags();
        
        var result = await _tagService.GetAllTagsAsync().ConfigureAwait(false);

        result.Value.ShouldNotBeNull();
        result.Success.ShouldBeTrue();
        result.Value.ShouldBeOfType(typeof(string[]));
        result.Value.Length.ShouldBe(0);
    }

    private async Task ClearTags()
    {
        _db.Tags.RemoveRange(_db.Tags);
        await _db.SaveChangesAsync(); 
    }
}