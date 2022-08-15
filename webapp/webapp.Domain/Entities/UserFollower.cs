namespace webapp.Domain.Entities;

public class UserFollower
{
    public string? UserFollowerId { get; set; }
    public string? UserId { get; set; }
    public virtual ApplicationUser? User { get; set; } 
    public string? FollowerId { get; set; }
    public virtual ApplicationUser? Follower { get; set; }
}