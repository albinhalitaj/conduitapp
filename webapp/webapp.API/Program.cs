using Microsoft.OpenApi.Models;
using webapp.API.ExtensionMethods;
using webapp.API.Filters;
using webapp.API.Services;
using webapp.Application;
using webapp.Application.Interfaces;
using webapp.Infrastructure;
using webapp.Infrastructure.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(opt =>
{
    opt.Filters.Add<ValidationFilter>();
}).AddNewtonsoftJson(options =>
    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
);
builder.Services.AddSwaggerGen(s =>
{
    s.SwaggerDoc("v1", new OpenApiInfo { Title = "Real World Conduit App API", Version = "v1"});
    s.SwaggerDoc("v2", new OpenApiInfo { Title = "Real World Conduit App API", Version = "v2"});
});

builder.Services.ConfigureApiVersioning();
builder.Services.Configure<RouteOptions>(options => { options.LowercaseUrls = true; });

builder.Services.AddSingleton<ICurrentUserService, CurrentUserService>();
builder.Services.AddHttpContextAccessor();

builder.Services
    .AddInfrastructure(builder.Configuration)
    .AddApplication();

builder.Services.ConfigureFluentValidation();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseExceptionHandler("/error");
    app.UseSwagger();
    app.UseSwaggerUI(x =>
    {
        x.SwaggerEndpoint("/swagger/v1/swagger.json","Version 1");
        x.SwaggerEndpoint("/swagger/v2/swagger.json","Version 2");
    });
    app.UseCors(x => x.AllowAnyHeader()
        .WithOrigins("http://localhost:3000", "http://localhost:4200")
        .AllowCredentials()
        .AllowAnyMethod());
    await app.SeedData();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();