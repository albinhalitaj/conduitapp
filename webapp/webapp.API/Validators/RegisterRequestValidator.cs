using FluentValidation;
using webapp.Contracts.Users;

namespace webapp.API.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty()
            .WithMessage("FirstName is required");
        RuleFor(x => x.LastName)
            .NotEmpty()
            .WithMessage("LastName is required");
        RuleFor(x => x.Username)
            .NotEmpty()
            .WithMessage("Username is required");
        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email is required")
            .EmailAddress()
            .WithMessage("Email must be a valid email address");
        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage("Password is required")
            .MinimumLength(8)
            .WithMessage("Password must be at least 8 characters");
    }
}