using Mapster;
using webapp.Contracts.Articles;
using webapp.Domain.Entities;

namespace webapp.Application.Mappings;

public class CommentMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config) => config.NewConfig<CreateArticleRequest, Comment>();
}