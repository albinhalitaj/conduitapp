namespace webapp.API.ApiExtensions;

public class ResultDto<T>
{
    public T? Value { get; set; }
    public IEnumerable<ErrorDto> Errors { get; set; } = new List<ErrorDto>();
    public bool Success => !Errors.Any();
}