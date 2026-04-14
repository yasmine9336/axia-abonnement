using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Models.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AxiaAbonnement.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(IServiceProvider services)
        {
            var context = services.GetRequiredService<AppDbContext>();
            await context.Database.MigrateAsync();
            await CreateUserIfNotExists(
                context,
                "admin@axiaabonnement.com",
                "Admin",
                UserRole.Admin,
                "Admin@123!"
            );
        }

        private static async Task CreateUserIfNotExists(
            AppDbContext ctx,
            string email,
            string username,
            UserRole role,
            string password)
        {
            if (await ctx.Users.AnyAsync(u => u.Email == email)) return;

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = username,
                Email = email,
                Role = role,
                IsActive = true,
                Statut = StatutCompte.Active
            };

            user.PasswordHash = new PasswordHasher<User>()
                .HashPassword(user, password);

            ctx.Users.Add(user);
            await ctx.SaveChangesAsync();
        }
    }
}