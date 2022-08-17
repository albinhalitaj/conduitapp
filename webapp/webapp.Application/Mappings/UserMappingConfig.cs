using Mapster;
using webapp.Contracts.Users;
using webapp.Domain.Entities;

namespace webapp.Application.Mappings;

public class UserMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<ApplicationUser, UserResponse>()
            .Map(dest => dest.Username, src => src.UserName);
    }
}