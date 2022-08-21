using Mapster;
using webapp.Contracts.Comments;
using webapp.Domain.Entities;

namespace webapp.Application.Mappings;

public class CommentMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<CreateCommentRequest, Comment>();

        config.NewConfig<Comment, CommentResponse>()
            .Map(dest => dest.Id, src => src.CommentId);
    }
}