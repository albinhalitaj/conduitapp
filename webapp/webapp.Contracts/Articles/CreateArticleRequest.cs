namespace webapp.Contracts.Articles;

public record CreateArticleRequest(string Title, string Description, string Body, string[]? Tags);