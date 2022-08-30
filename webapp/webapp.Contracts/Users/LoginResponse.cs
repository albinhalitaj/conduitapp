namespace webapp.Contracts.Users;

public record User(string Id, string Username, string Email, string Role, DateTimeOffset ExpiresAt, string? Bio, string? Image);