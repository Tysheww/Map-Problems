using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MapOfProblems.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAuthorEmailToIssue : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AuthorEmail",
                table: "Issues",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AuthorEmail",
                table: "Issues");
        }
    }
}
