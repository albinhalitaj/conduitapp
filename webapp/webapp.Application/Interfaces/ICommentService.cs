using webapp.Contracts.Comments;
using webapp.Contracts.Common;

namespace webapp.Application.Interfaces;

public interface ICommentService
{
    Task<ResultDto<CommentResponse>> CreateComment(string slug,CreateCommentRequest comment);
    Task<ResultDto<string>> DeleteCommentAsync(string articleSlug, string commentId);
    Task<ResultDto<List<CommentResponse>>> ListComments(string slug);
}