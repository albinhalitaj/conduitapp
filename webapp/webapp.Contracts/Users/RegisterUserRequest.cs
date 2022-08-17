namespace webapp.Contracts.Users;

public record RegisterRequest(string FirstName,string LastName,string Username,string? Bio,string Email,string Password);
