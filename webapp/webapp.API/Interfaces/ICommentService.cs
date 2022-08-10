using webapp.API.ApiExtensions;
using webapp.API.DTOs;
using webapp.API.Services;

namespace webapp.API.Interfaces;

public interface ICommentService
{
    Task<ResultDto<CommentResponse>> CreateComment(string slug,CreateCommentRequest comment);
    Task<ResultDto<string>> DeleteCommentAsync(string articleSlug, string commentId);
    Task<ResultDto<List<CommentResponse>>> ListComments(string slug);
}