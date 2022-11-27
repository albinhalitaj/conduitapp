using Microsoft.AspNetCore.Mvc;
using webapp.Contracts.Common;

namespace webapp.API.Controllers.V1;

[ApiVersion("1.0")]
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class ApiController : ControllerBase
{
    protected IActionResult Problem(IEnumerable<ErrorDto> errors)
    {
        var error = errors.SingleOrDefault();
        return error!.ErrorCode == "NotFound"
            ? Problem(statusCode: StatusCodes.Status404NotFound, title: error.Message)
            : Problem(statusCode: StatusCodes.Status400BadRequest, title: error.Message);
    }
}