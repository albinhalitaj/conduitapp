using Mapster;
using webapp.Application.Common;
using webapp.Application.Interfaces;
using webapp.Contracts.Articles;
using webapp.Domain.Entities;

namespace webapp.Application.Mappings;

public class ArticleMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<CreateArticleRequest, Article>()
            .Map(dest => dest.Slug, src => src.Title.Slugify())
            .Map(dest => dest.ArticleId, _ => Guid.NewGuid())
            .Map(dest => dest.AuthorId, _ => MapContext.Current.GetService<ICurrentUserService>().UserId)
            .Ignore(x => x.Tags);

        config.NewConfig<ArticleTags, Article>()
            .Map(dest => dest.Author,
                src => new ApplicationUser
                {
                    UserName = src.Article!.Author!.UserName,
                    Bio = src.Article.Author.Bio,
                    Image = src.Article.Author.Image
                })
            .Map(dest => dest, src => src.Article)
            .Map(dest => dest.TagsArray, src => src.Article!.Tags.Select(x => x.Tag!.Text).ToArray())
            .Ignore(m => m.IsFollowing);

        config.NewConfig<Article, Article>()
            .Map(dest => dest.Author,
                src => new ApplicationUser
                {
                    UserName = src.Author!.UserName,
                    Bio = src.Author.Bio,
                    Image = src.Author.Image
                })
            .Map(dest => dest.TagsArray, src => src.Tags.Select(x => x.Tag!.Text).ToArray())
            .Ignore(m => m.IsFollowing);

        config.NewConfig<UserFavorite, Article>()
            .Map(dest => dest.Author, src => new ApplicationUser
            {
                UserName = src.Article!.Author!.UserName,
                Bio = src.Article.Author.Bio,
                Image = src.Article.Author.Image
            })
            .Map(dest => dest, src => src.Article)
            .Map(dest => dest.TagsArray, src => src.Article!.Tags.Select(x => x.Tag!.Text).ToArray())
            .Ignore(m => m.IsFollowing);
    }
}