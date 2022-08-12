using webapp.API.ApiExtensions;
using webapp.API.Models;

namespace webapp.API.Interfaces;

public interface ITagService 
{
    Task<string> CreateTagAsync(string tag);
    Task<ResultDto<List<Tag>>> GetAllTagsAsync();
}