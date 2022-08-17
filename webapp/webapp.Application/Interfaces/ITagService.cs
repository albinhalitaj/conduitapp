using webapp.Contracts.Common;
using webapp.Domain.Entities;

namespace webapp.Application.Interfaces;

public interface ITagService
{
    Task<string> CreateTagAsync(string tag);
    Task<ResultDto<string[]>> GetAllTagsAsync();
    Task<string?> CheckIfExists(string tag);
}