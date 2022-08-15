using Microsoft.AspNetCore.Identity;

namespace webapp.Domain.Entities;

public class ApplicationUser : IdentityUser
{
    public ApplicationUser()
    {
        Articles = new HashSet<Article>();
        Comments = new HashSet<Comment>();
    }
    
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Bio { get; set; }
    public string? Image { get; set; }
    
    public ICollection<Article> Articles { get; set; }
    public ICollection<Comment> Comments { get; set; }
}