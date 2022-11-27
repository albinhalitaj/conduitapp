using AutoFixture;
using Microsoft.EntityFrameworkCore;
using Moq;
using Shouldly;
using webapp.Application.Interfaces;
using webapp.Application.Services;
using webapp.Contracts.Common;
using webapp.Contracts.Profiles;
using webapp.Domain.Entities;
using webapp.Infrastructure.Data;

namespace webapp.ApplicationTests.Services;

public class ProfileServiceTests
{
    private readonly ProfileService _profileService;
    private readonly AppDbContext _db;
    private readonly IFixture _fixture = new Fixture();
    private readonly Mock<ICurrentUserService> _currentUserService = new();
    private readonly ApplicationUser _appUser;

    public ProfileServiceTests()
    {
        _appUser = new ApplicationUser
            { Id = _fixture.Create<Guid>().ToString(), UserName = "user1", FirstName = "Albin", LastName = "Halitaj" };
        _currentUserService.Setup(x => x.UserId).Returns(_fixture.Create<Guid>().ToString);
        var dbContextOptions = new DbContextOptionsBuilder<AppDbContext>().UseInMemoryDatabase("Testing");
        _db = new AppDbContext(dbContextOptions.Options);
        _profileService = new ProfileService(_db,_currentUserService.Object);
    }

    private async Task AddUser()
    {
        await _db.Users.AddAsync(_appUser);
        await _db.SaveChangesAsync();
    }

    [Fact]
    public async Task GetUser_ShouldReturnUser_IfUserFound()
    {
        // arrange
        const string user = "user1";
        await _db.Users.AddAsync(new ApplicationUser { UserName = user, FirstName = "Albin", LastName = "Halitaj" });
        await _db.SaveChangesAsync();
        
        // act
        var result = await _profileService.GetUser(user).ConfigureAwait(false);

        //assert
        result.ShouldNotBeNull();
        result.ShouldBeOfType<ResultDto<ProfileResponse>>();
        result.Value?.Username.ShouldBe(user);
        result.Value?.Following.ShouldBeFalse();
        result.Success.ShouldBeTrue();
        result.Errors.ShouldBeEmpty();
    }

    [Fact]
    public async Task GetUser_ShouldReturnNull_IfUserNotFound()
    {
        const string user = "UserNotExists";

        var result = await _profileService.GetUser(user).ConfigureAwait(false);
        
        result.Value.ShouldBeNull();
        result.Errors.ShouldBeOfType<List<ErrorDto>>();
        result.Errors.FirstOrDefault()?.Message.ShouldBe($"User {user} was not found!");
        result.Errors.FirstOrDefault()?.ErrorCode.ShouldBe("NotFound");
        result.Success.ShouldBeFalse();
    }

    [Fact]
    public async Task GetUser_ShouldReturnFollowingTrue_IfUserIsFollowing()
    {
        _db.Users.RemoveRange(_db.Users);
        await _db.SaveChangesAsync();

        
        await _db.Users.AddAsync(_appUser);
        await _db.UserFollowers.AddAsync(new UserFollower { FollowerId = _currentUserService.Object.UserId, UserId = _appUser.Id });
        await _db.SaveChangesAsync();
        
        var result = await _profileService.GetUser(_appUser.UserName).ConfigureAwait(false);
        
        result.Success.ShouldBeTrue();
        result.Value.ShouldBeOfType<ProfileResponse>();
        result.Value.Username.ShouldBe(_appUser.UserName);
        result.Value.Following.ShouldBeTrue();
        result.Errors.ShouldBeOfType<List<ErrorDto>>();
        result.Errors.ShouldBeEmpty();
    }
    
    [Fact]
    public async Task GetUser_ShouldReturnFollowingFalse_IfUserIsNotFollowing()
    {
        await AddUser();
        
        var result = await _profileService.GetUser(_appUser.UserName).ConfigureAwait(false);
        
        result.Success.ShouldBeTrue();
        result.Value.ShouldBeOfType<ProfileResponse>();
        result.Value.Username.ShouldBe(_appUser.UserName);
        result.Value.Following.ShouldBeFalse();
        result.Errors.ShouldBeOfType<List<ErrorDto>>();
        result.Errors.ShouldBeEmpty();
    }

    [Fact]
    public async Task FollowUser_ShouldFollow_IfUserExistsAndNotFollowing()
    {
        await AddUser();

        var result = await _profileService.FollowUser(_appUser.UserName).ConfigureAwait(false);

        result.ShouldNotBeNull();
        result.ShouldBeOfType<ResultDto<ProfileResponse>>();
        result.Success.ShouldBeTrue();
        result.Errors.ShouldBeEmpty();
        result.Value.ShouldNotBeNull();
        result.Value.Following.ShouldBe(true);
    }

    [Fact]
    public async Task FollowUser_ReturnsNotFoundError_IfUserDoesntExists()
    {
        const string username = "appuser";
        
        var result = await _profileService.FollowUser(username).ConfigureAwait(false);

        result.ShouldNotBeNull();
        result.ShouldBeOfType<ResultDto<ProfileResponse>>();
        result.Success.ShouldBeFalse();
        result.Errors.ShouldNotBeNull();
        result.Errors.FirstOrDefault()?.Message.ShouldBe($"No user found with username {username}");
        result.Errors.FirstOrDefault()?.ErrorCode.ShouldBe("NotFound");
        result.Value.ShouldBeNull();
    }

    [Fact]
    public async Task FollowUser_ReturnsError_IfUserAlreadyFollowing()
    {
        await _db.UserFollowers.AddAsync(new UserFollower { FollowerId = _currentUserService.Object.UserId, UserId = _appUser.Id });
        await AddUser();
        
        var result = await _profileService.FollowUser(_appUser.UserName).ConfigureAwait(false);

        result.ShouldNotBeNull();
        result.ShouldBeOfType<ResultDto<ProfileResponse>>();
        result.Success.ShouldBeFalse();
        result.Errors.ShouldNotBeNull();
        result.Errors.FirstOrDefault()?.Message.ShouldBe($"You are already following {_appUser.UserName}!");
        result.Value.ShouldBeNull();
    }

    [Fact]
    public async Task UnFollowUser_ShouldUnFollowUser_IfUserIsFollowing()
    {
        await Clear();
        await _db.UserFollowers.AddAsync(new UserFollower { FollowerId = _currentUserService.Object.UserId, UserId = _appUser.Id });
        await AddUser();

        _db.ChangeTracker.Clear();
        var result = await _profileService.UnFollowUser(_appUser.UserName).ConfigureAwait(false);

        result.ShouldNotBeNull();
        result.ShouldBeOfType<ResultDto<ProfileResponse>>();
        result.Success.ShouldBeTrue();
        result.Errors.ShouldBeOfType<List<ErrorDto>>();
        result.Value.ShouldNotBeNull();
        result.Value.ShouldBeOfType<ProfileResponse>();
        result.Value.Following.ShouldBeFalse();
    }

    [Fact]
    public async Task UnFollowUser_ShouldReturnNotFound_IfProfileNotFound()
    {
        await Clear();
        const string profile = "idontexists";
        
        var result = await _profileService.UnFollowUser(profile).ConfigureAwait(false);

        result.ShouldNotBeNull();
        result.Success.ShouldBeFalse();
        result.Value.ShouldBeNull();
        result.Errors.FirstOrDefault()?.Message.ShouldBe($"Profile not found with username {profile}");
        result.Errors.FirstOrDefault()?.ErrorCode.ShouldBe("NotFound");
        result.ShouldBeOfType<ResultDto<ProfileResponse>>();
    }

    [Fact]
    public async Task UnFollowUser_ShouldReturnError_IfUserIsNotFollowing()
    {
        await Clear();
        await AddUser();
        
        var result = await _profileService.UnFollowUser(_appUser.UserName).ConfigureAwait(false);

        result.ShouldNotBeNull();
        result.Success.ShouldBeFalse();
        result.Value.ShouldBeNull();
        result.Errors.FirstOrDefault()?.Message.ShouldBe($"You are not following {_appUser.UserName}");
        result.ShouldBeOfType<ResultDto<ProfileResponse>>(); 
    }

    private async Task Clear()
    {
        _db.Users.RemoveRange(_db.Users);
        _db.UserFollowers.RemoveRange(_db.UserFollowers);
        await _db.SaveChangesAsync();
    }
}