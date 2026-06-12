using MapOfProblems.API.Models;
using Microsoft.EntityFrameworkCore;

namespace MapOfProblems.API.Data;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Issue> Issues { get; set; }
    public DbSet<Comment> Comments { get; set; }

    public DbSet<User> Users { get; set; }
    // --- НОВИЙ БЛОК НАЛАШТУВАНЬ ---
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Глобальний фільтр: автоматично ховати всі "видалені" заявки з усіх GET-запитів
        modelBuilder.Entity<Issue>().HasQueryFilter(i => !i.IsDeleted);
    }
}