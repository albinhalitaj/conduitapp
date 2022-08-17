namespace webapp.Contracts.Users;

public record UpdateUserRequest(string Email,string Username, string? Image,string? Bio);
