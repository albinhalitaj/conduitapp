using webapp.Contracts.Common;

namespace webapp.Application.Interfaces;

public interface ITagService
{
    Task<string> CreateTagAsync(string tag);
    Task<ResultDto<string[]>> GetAllTagsAsync();
    Task<string?> CheckIfExists(string tag);
}