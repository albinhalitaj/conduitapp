using FluentValidation;
using webapp.Contracts.Users;

namespace webapp.API.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.UsernameOrEmail)
            .NotEmpty()
            .NotNull()
            .WithMessage("Username or Email is required");
        RuleFor(x => x.Password)
            .NotEmpty()
            .NotNull()
            .WithMessage("Password is required");
    }
}