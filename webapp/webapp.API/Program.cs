using Microsoft.EntityFrameworkCore;
using webapp.API.Data;
using webapp.API.ExtensionMethods;
using webapp.API.Filters;
using webapp.API.Interfaces;
using webapp.API.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(opt =>
{
    opt.Filters.Add<ValidationFilter>();
}).AddNewtonsoftJson(options =>
    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

builder.Services.AddScoped<IIdentityService, IdentityService>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddScoped<IArticleService, ArticlesService>();
builder.Services.AddScoped<ICommentService, CommentsService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<CurrentUserService>();

builder.Services.AddHttpContextAccessor();

builder.Services.AddDbContext<AppDbContext>(
    x => x.UseSqlServer(builder.Configuration.GetConnectionString("DesktopConn")));

builder.Services.ConfigureFluentValidation();
builder.Services.AddJwtAuth(builder.Configuration);
builder.Services.ConfigureIdentityProviders();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors(x => x.AllowAnyHeader()
        .WithOrigins("http://localhost:3000", "http://localhost:4200")
        .AllowCredentials()
        .AllowAnyMethod());
    await app.SeedData();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();