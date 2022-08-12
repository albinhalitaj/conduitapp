using Microsoft.AspNetCore.Mvc;

namespace webapp.API.Controllers.V2;

[ApiVersion("2.0")]
public class ArticlesController : ApiController
{
    [HttpGet]
    public string Get()
    {
        return "Hello from v2";
    }
}