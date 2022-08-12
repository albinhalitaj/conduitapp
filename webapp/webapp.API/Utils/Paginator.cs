namespace webapp.API.Utils;

public class Paginator
{
    public int Limit { get; set; }
    public int Offset { get; set; }
    public Paginator(int limit,int offset)
    {
        Limit = limit is 0 or > 20 ? 20 : limit;
        Offset = offset is 0 or < 0 ? 0 : offset;
    }
}