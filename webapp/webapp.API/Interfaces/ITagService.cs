using webapp.API.Models;

namespace webapp.API.Interfaces;

public interface ITagService 
{
    Task<string> CreateTagAsync(string tag);
    Task<List<Tag>> GetAllTagsAsync();
    Task<bool> TagExists(string tagName);
}