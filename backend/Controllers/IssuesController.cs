using MapOfProblems.API.Data;
using MapOfProblems.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization; // Додали для правильного читання крапок/ком у координатах

namespace MapOfProblems.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class IssuesController : ControllerBase
{
    private readonly AppDbContext _context;

    public IssuesController(AppDbContext context)
    {
        _context = context;
    }

    // 1. Отримати всі активні заявки
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Issue>>> GetIssues()
    {
        // Повертаємо тільки ті, що НЕ видалені
        return await _context.Issues
            .Include(i => i.Comments)
            .Where(i => i.IsDeleted == false) 
            .ToListAsync();
    }

    // 2. Створити нову заявку з фотографією (КУЛЕНЕПРОБИВНИЙ МЕТОД)
    [HttpPost]
    public async Task<ActionResult<Issue>> PostIssue(
        [FromForm] string Title, 
        [FromForm] string Description, 
        [FromForm] string Category, 
        [FromForm] string Latitude, 
        [FromForm] string Longitude, 
        IFormFile? photo)
    {
        string photoUrl = "";

        // Якщо користувач прикріпив фото, зберігаємо його локально
        if (photo != null && photo.Length > 0)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            
            // Створюємо папку, якщо її немає
            if (!Directory.Exists(uploadsFolder)) 
                Directory.CreateDirectory(uploadsFolder);

            // Генеруємо унікальне ім'я файлу
            var uniqueFileName = Guid.NewGuid().ToString() + "_" + photo.FileName;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Зберігаємо файл на диск
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await photo.CopyToAsync(fileStream);
            }

            // Формуємо посилання на файл
            photoUrl = $"http://localhost:5023/uploads/{uniqueFileName}";
        }

        // Надійно парсимо координати (завжди беремо крапку як розділювач, незалежно від мови Windows)
        double lat = double.Parse(Latitude.Replace(',', '.'), CultureInfo.InvariantCulture);
        double lng = double.Parse(Longitude.Replace(',', '.'), CultureInfo.InvariantCulture);

        // Вручну створюємо об'єкт проблеми
        var issue = new Issue
        {
            Title = Title,
            Description = Description,
            Category = Category,
            Latitude = lat,
            Longitude = lng,
            Status = "Очікує розгляду",
            PhotoUrl = photoUrl,
            CreatedAt = DateTime.UtcNow,
            Upvotes = 0
        };

        _context.Issues.Add(issue);
        await _context.SaveChangesAsync();

        return Ok(issue);
    }

    // 3. Додати голос "Підтримати" (Upvote)
    [HttpPut("{id}/upvote")]
    public async Task<IActionResult> UpvoteIssue(int id)
    {
        var issue = await _context.Issues.FindAsync(id);
        if (issue == null) return NotFound("Проблему не знайдено.");

        issue.Upvotes++;
        await _context.SaveChangesAsync();

        return Ok(issue); 
    }

    // 4. Додати коментар до проблеми
    [HttpPost("{id}/comments")]
    public async Task<ActionResult<Comment>> AddComment(int id, Comment comment)
    {
        var issue = await _context.Issues.FindAsync(id);
        if (issue == null) return NotFound("Проблему не знайдено.");

        comment.IssueId = id;
        comment.CreatedAt = DateTime.UtcNow;

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return Ok(comment);
    }

    // 5. Оновити статус проблеми
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
    {
        var issue = await _context.Issues.FindAsync(id);
        if (issue == null) return NotFound("Проблему не знайдено.");

        issue.Status = newStatus;
        await _context.SaveChangesAsync();

        return Ok(issue);
    }

    // 6. Видалити проблему (Soft Delete)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIssue(int id)
    {
        var issue = await _context.Issues.FindAsync(id);
        if (issue == null) return NotFound("Проблему не знайдено.");

        issue.IsDeleted = true;
        await _context.SaveChangesAsync();

        return NoContent(); 
    }
}