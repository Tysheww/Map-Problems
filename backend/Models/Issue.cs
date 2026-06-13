namespace MapOfProblems.API.Models;

public class Issue
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? PhotoUrl { get; set; } 
    public string Status { get; set; } = "Очікує розгляду";
    public int Upvotes { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; } = false;

    // === НОВИЙ РЯДОК: ДОДАЄМО ПОШТУ АВТОРА ===
    public string? AuthorEmail { get; set; } 

    public List<Comment> Comments { get; set; } = new();
}