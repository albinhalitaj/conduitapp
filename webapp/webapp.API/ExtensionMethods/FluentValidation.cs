using System.Reflection;
using FluentValidation.AspNetCore;

namespace webapp.API.ExtensionMethods;

public static class FluentValidation
{
    public static void ConfigureFluentValidation(this IServiceCollection services)
    {
        services.AddFluentValidation(x 
                => x.RegisterValidatorsFromAssembly(Assembly.GetExecutingAssembly()))
            .AddHttpContextAccessor();
    }
}