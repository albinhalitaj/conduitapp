using webapp.API.DTOs;
using webapp.API.Models;

namespace webapp.API.Interfaces;

public interface ITagService 
{
    Task<bool> CreateTagAsync(string tag);
    Task<List<Tag>> GetAllTagsAsync();
    Task<bool> TagExists(string tagName);
}