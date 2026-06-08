using MapOfProblems.API.Data;
using MapOfProblems.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

    // 1. Отримати всі заявки (РАЗОМ З КОМЕНТАРЯМИ)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Issue>>> GetIssues()
    {
        // Метод Include() каже базі: "Дістань проблеми, і одразу підтягни всі коментарі до них"
        return await _context.Issues.Include(i => i.Comments).ToListAsync();
    }

    // 2. Створити нову заявку
    [HttpPost]
    public async Task<ActionResult<Issue>> CreateIssue(Issue issue)
    {
        issue.CreatedAt = DateTime.UtcNow;
        _context.Issues.Add(issue);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetIssues), new { id = issue.Id }, issue);
    }

    // --- НОВИЙ ФУНКЦІОНАЛ ---

    // 3. Додати голос "Підтримати" (Upvote)
    // Шлях буде виглядати так: PUT /api/Issues/1/upvote
    [HttpPut("{id}/upvote")]
    public async Task<IActionResult> UpvoteIssue(int id)
    {
        // Шукаємо проблему за ID
        var issue = await _context.Issues.FindAsync(id);
        if (issue == null) return NotFound("Проблему не знайдено.");

        // Збільшуємо лічильник на 1 і зберігаємо
        issue.Upvotes++;
        await _context.SaveChangesAsync();

        return Ok(issue); // Повертаємо оновлену проблему
    }

    // 4. Додати коментар до проблеми
    // Шлях буде виглядати так: POST /api/Issues/1/comments
    [HttpPost("{id}/comments")]
    public async Task<ActionResult<Comment>> AddComment(int id, Comment comment)
    {
        // Перевіряємо, чи існує проблема, яку ми хочемо прокоментувати
        var issue = await _context.Issues.FindAsync(id);
        if (issue == null) return NotFound("Проблему не знайдено.");

        // Прив'язуємо коментар до конкретної проблеми і ставимо час
        comment.IssueId = id;
        comment.CreatedAt = DateTime.UtcNow;

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return Ok(comment);
    }

    // 5. Оновити статус проблеми (для працівників міськради)
    // PUT /api/Issues/1/status
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
    {
        var issue = await _context.Issues.FindAsync(id);
        if (issue == null) return NotFound("Проблему не знайдено.");

        issue.Status = newStatus;
        await _context.SaveChangesAsync();

        return Ok(issue);
    }

    // 6. Видалити проблему (Soft Delete - для модераторів)
    // DELETE /api/Issues/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIssue(int id)
    {
        var issue = await _context.Issues.FindAsync(id);
        if (issue == null) return NotFound("Проблему не знайдено.");

        // Замість _context.Issues.Remove(issue) ми робимо "м'яке" видалення
        issue.IsDeleted = true;
        await _context.SaveChangesAsync();

        return NoContent(); // Стандартна відповідь для успішного видалення (код 204)
    }
}