using AutoMapper;
using Microsoft.EntityFrameworkCore;
using webapp.API.ApiExtensions;
using webapp.API.Data;
using webapp.API.DTOs;
using webapp.API.Interfaces;
using webapp.API.Models;

namespace webapp.API.Services;

public class CommentsService : ICommentService
{
    private readonly AppDbContext _ctx;
    private readonly CurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public CommentsService(AppDbContext ctx, CurrentUserService currentUserService, IMapper mapper)
    {
        _ctx = ctx;
        _currentUserService = currentUserService;
        _mapper = mapper;
    }

    public async Task<ResultDto<CommentResponse>> CreateComment(string articleSlug,CreateCommentRequest comment)
    {
        var response = new ResultDto<CommentResponse>();
        var errors = new List<ErrorDto>();
        var article = await _ctx.Articles.Where(x => x.Slug == articleSlug)
            .Select(x => new
            {
                x.ArticleId,
                AuthorId = x.Author!.Id,
            }).FirstOrDefaultAsync();
        var user = await _ctx.Users.Where(x => x.Id == _currentUserService.UserId)
            .Select(x => new
            {
                x.Id,
                Username = x.UserName,
                x.Bio,
                x.Image
            }).FirstOrDefaultAsync();
        if (article is null)
        {
            errors.Add(new ErrorDto { Message = $"Article with slug {articleSlug} was not found!" });
        }
        else
        {
            try
            {
                var commentToCreate = _mapper.Map<Comment>(comment);
                commentToCreate.ArticleId = article.ArticleId;
                commentToCreate.AuthorId = user!.Id;
                await _ctx.Comments.AddAsync(commentToCreate);
                var result = await _ctx.SaveChangesAsync();
                if (result <= 0) return response;
                var isFollowing = await _ctx.UserFollowers.AsNoTracking().AnyAsync(x =>
                    x.FollowerId == _currentUserService.UserId && x.UserId == article.AuthorId);
                var author = new Author(user.Username, user.Bio, user.Image, isFollowing);
                response.Value = new CommentResponse(commentToCreate.CommentId!, commentToCreate.CreatedAt,
                    commentToCreate.UpdatedAt, commentToCreate.Body!, author);
                return response;
            }
            catch (Exception e)
            {
                errors.Add(new ErrorDto { Message = e.Message });
            }
        }
        response.Errors = errors;
        return response;
    }

    public async Task<ResultDto<string>> DeleteCommentAsync(string articleSlug, string commentId)
    {
        var result = new ResultDto<string>();
        if (articleSlug != string.Empty && commentId != string.Empty)
        {
            try
            {
                var commentToDelete = new Comment { CommentId = commentId };
                if (commentToDelete.AuthorId == _currentUserService.UserId)
                {
                    _ctx.Comments.Remove(commentToDelete);
                    await _ctx.SaveChangesAsync();
                    result.Value = $"Comment with id: {commentId} deleted successfully";
                }
                else
                {
                    result.Errors = new List<ErrorDto>
                        {new() {Message = $"Could not find comment with id: {commentId}"}};
                }
            }
            catch (Exception e)
            {
                result.Errors = new List<ErrorDto> {new() {Message = e.Message}};
            }
        }
        result.Errors = new List<ErrorDto> {new() {Message = "Please provide article slug and comment id"}};
        return result;
    }

    public async Task<ResultDto<List<CommentResponse>>> ListComments(string slug)
    {
        var response = new ResultDto<List<CommentResponse>>();
        var article = await _ctx.Articles.AsNoTracking().Include(x=>x.Comments).FirstOrDefaultAsync(x => x.Slug == slug);
        if (article is not {Comments: { }}) return response;
        {
            var comments = new List<CommentResponse>();
            foreach (var comment in article.Comments)
            {
                var commentAuthor = await _ctx.Users.Where(x=>x.Id == comment.AuthorId)
                    .Select(x => new CommentAuthor(x.UserName, x.Bio, x.Image)).FirstOrDefaultAsync();
                var isFollowing = await _ctx.UserFollowers.AsNoTracking().AnyAsync(x =>
                    x.FollowerId == _currentUserService.UserId && x.UserId == comment.Author.Id);
                var author = new Author(commentAuthor!.Username, commentAuthor.Bio, commentAuthor.Image, isFollowing);
                comments.Add(new CommentResponse(comment.CommentId!,comment.CreatedAt,comment.UpdatedAt,comment.Body!,author));
            }
            response.Value = comments;
            return response;
        }
    }
}

public record CommentResponse(string Id,DateTimeOffset CreatedAt,DateTimeOffset UpdatedAt,string Body,Author Author);

internal record CommentAuthor(string Username, string Bio, string Image);
