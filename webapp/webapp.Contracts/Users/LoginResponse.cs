namespace webapp.Contracts.Users;

public record User(string Id, string Username, string Email, string[] Roles, DateTimeOffset ExpiresAt);