namespace webapp.Contracts.Users;

public record LoginRequest(string UsernameOrEmail, string Password);