using MapOfProblems.API.Data;
using MapOfProblems.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MapOfProblems.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] User request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest("Користувач з такою поштою вже існує.");

        var user = new User
        {
            Email = request.Email,
            Password = request.Password, 
            IsAdmin = request.Email == "adminzt@gmail.com" 
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { Email = user.Email, IsAdmin = user.IsAdmin });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] User request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.Password == request.Password);
        
        if (user == null)
            return Unauthorized("Неправильна пошта або пароль.");

        return Ok(new { Email = user.Email, IsAdmin = user.IsAdmin });
    }
}