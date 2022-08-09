using FluentValidation;
using webapp.API.DTOs;

namespace webapp.API.Validators;

public class CreateCommentRequestValidator : AbstractValidator<CreateCommentRequest>
{
    public CreateCommentRequestValidator()
    {
        RuleFor(x => x.Body)
            .NotEmpty()
            .WithMessage("Comment Body cannot be empty");
    }
}