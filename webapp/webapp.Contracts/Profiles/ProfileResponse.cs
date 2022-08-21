namespace webapp.Contracts.Profiles
{
    public record ProfileResponse(string Username, string? Bio, string? Image, bool Following);
}