namespace MapOfProblems.API.Models;

public class Issue
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public double Latitude { get; set; } 
    public double Longitude { get; set; }
    public string Status { get; set; } = "Очікує розгляду";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // --- ДОДАЄМО НОВІ ПОЛЯ СЮДИ ---

    // Простий лічильник голосів "Підтримати"
    public int Upvotes { get; set; } = 0;

    // Навігаційна властивість: Одна проблема має БАГАТО коментарів (зв'язок 1-до-багатьох)
    public List<Comment> Comments { get; set; } = new();

    public bool IsDeleted { get; set; } = false;
}