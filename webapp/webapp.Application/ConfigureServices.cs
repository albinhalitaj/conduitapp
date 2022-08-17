using Microsoft.Extensions.DependencyInjection;
using webapp.Application.Interfaces;
using webapp.Application.Mappings;
using webapp.Application.Services;

namespace webapp.Application;

public static class ConfigureServices
{
   public static IServiceCollection AddApplication(this IServiceCollection services)
   {
      services.AddMappers();
      services.AddScoped<IArticleService, ArticlesService>();
      services.AddScoped<ICommentService, CommentsService>();
      services.AddScoped<IProfileService, ProfileService>();
      services.AddScoped<ITagService, TagService>();
      return services;
   }
}