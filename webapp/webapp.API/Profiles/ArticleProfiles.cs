using webapp.API.Controllers;
using webapp.API.DTOs;
using webapp.API.Models;
using webapp.API.Services;
using Profile = AutoMapper.Profile;

namespace webapp.API.Profiles;

public class ArticleProfiles : Profile
{
    public ArticleProfiles()
    {
        CreateMap<ApplicationUser, AuthorResponse>();
        CreateMap<Article, ArticleResponse>()
            .ForMember(x => x.Author,
                opt => opt.Ignore());
        CreateMap<CreateCommentRequest,Comment>();
        CreateMap<Comment, CommentResponse>();
        CreateMap<CreateArticle, Article>()
            .ForMember(x=>x.Tags,opt => opt.Ignore())
            .ReverseMap();
        CreateMap<ApplicationUser, UserResponse>();
        CreateMap<UpdateUserRequest, ApplicationUser>();
    }
}

public record AuthorResponse(string Username,string Bio,string Image);