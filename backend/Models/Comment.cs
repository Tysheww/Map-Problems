namespace MapOfProblems.API.Models;

public class Comment
{
    public int Id { get; set; }
    
    public string Text { get; set; } = string.Empty;
    
    // Поки що зберігаємо ім'я текстом. 
    // Пізніше, коли додамо авторизацію, тут буде зв'язок з таблицею Users
    public string AuthorName { get; set; } = "Анонім"; 
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // --- НАЛАШТУВАННЯ ЗВ'ЯЗКУ ---
    // Це Зовнішній ключ (Foreign Key), який вказує, до якої саме проблеми належить коментар
    public int IssueId { get; set; }
}