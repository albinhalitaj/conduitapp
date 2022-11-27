namespace webapp.Domain.Interfaces;

public interface IAuditableEntity
{
    DateTime CreateAtUtc { get; set; }
    DateTime? UpdatedAtUtc { get; set; }
}