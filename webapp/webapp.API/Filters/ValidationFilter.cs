using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using webapp.Contracts.Common;

namespace webapp.API.Filters;

public class ValidationFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (!context.ModelState.IsValid)
        {
            var errorModelState = context.ModelState
                .Where(x => x.Value!.Errors.Count > 0)
                .ToDictionary(kvp => kvp.Key,
                    kvp => kvp.Value!.Errors.Select(x => x.ErrorMessage)).ToArray();

            var response = new ResultDto<ErrorDto>();

            foreach (var error in errorModelState)
            {
                foreach (var errorValue in error.Value)
                    response.Errors = new List<ErrorDto> {new() {Message = errorValue}};
            }

            context.Result = new BadRequestObjectResult(response);
            return;
        }

        await next();
    }
}