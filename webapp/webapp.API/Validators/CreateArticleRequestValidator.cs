using FluentValidation;
using webapp.API.DTOs;

namespace webapp.API.Validators;

public class CreateArticleRequestValidator : AbstractValidator<CreateArticleRequest>
{
    public CreateArticleRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Title Field is required");

        RuleFor(x => x.Body)
            .NotEmpty()
            .WithMessage("Article Body is required");

        RuleFor(x => x.Description)
            .NotEmpty()
            .WithMessage("Article Description is required");
    }
}