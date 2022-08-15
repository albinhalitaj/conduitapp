using webapp.Contracts.Articles;
using webapp.Contracts.Authors;
using webapp.Contracts.Comments;
using webapp.Contracts.Users;
using webapp.Domain.Entities;
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
        CreateMap<CreateArticleRequest, Article>()
            .ForMember(x=>x.Tags,opt => opt.Ignore())
            .ReverseMap();
        CreateMap<ApplicationUser, UserResponse>();
        CreateMap<UpdateUserRequest, ApplicationUser>();
        CreateMap<ApplicationUser, User>();
    }
}
