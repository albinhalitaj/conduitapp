namespace webapp.Contracts.Articles;

public record UpdateArticleRequest(string Title, string Body, string Description, string[]? Tags);
