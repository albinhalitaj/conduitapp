namespace webapp.Contracts.Common;

public class Paginator
{
    public int Limit { get; }
    public int Offset { get; }

    public Paginator(int limit, int offset)
    {
        Limit = limit is 0 or > 20 ? 20 : limit;
        Offset = offset is 0 or < 0 ? 0 : offset;
    }
}