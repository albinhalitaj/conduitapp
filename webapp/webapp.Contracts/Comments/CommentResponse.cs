using webapp.Contracts.Authors;

namespace webapp.Contracts.Comments;

public record CommentResponse(string Id, DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt, string Body,
    Author Author);