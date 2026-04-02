using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Users;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AxiaAbonnement.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _ctx;

        public UserService(AppDbContext ctx) => _ctx = ctx;

        // Liste tous les responsables
        public async Task<List<UserDto>> GetResponsablesAsync() =>
            await _ctx.Users
                .Where(u => u.Role == "Responsable")
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    IsActive = u.IsActive,
                    ProfileImageUrl = u.ProfileImageUrl
                })
                .ToListAsync();

        // Créer un responsable
        public async Task<User?> CreateResponsableAsync(CreateResponsableDto dto)
        {
            if (await _ctx.Users.AnyAsync(u => u.Email == dto.Email)) return null;
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = dto.Username,
                Email = dto.Email,
                Role = "Responsable",
                IsActive = true
            };
            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, dto.Password);
            _ctx.Users.Add(user);
            await _ctx.SaveChangesAsync();
            return user;
        }

        // Modifier un responsable
        public async Task<bool> UpdateResponsableAsync(Guid id, UpdateResponsableDto dto)
        {
            var user = await _ctx.Users.FindAsync(id);
            if (user is null || user.Role != "Responsable") return false;

            // Met à jour seulement si la valeur est fournie
            if (!string.IsNullOrWhiteSpace(dto.Username))
                user.Username = dto.Username;

            if (!string.IsNullOrWhiteSpace(dto.Email))
                user.Email = dto.Email;

            if (dto.PhoneNumber is not null)
                user.PhoneNumber = dto.PhoneNumber;

            await _ctx.SaveChangesAsync();
            return true;
        }

        // Activer / Désactiver
        public async Task<bool?> ToggleResponsableAsync(Guid id)
        {
            var user = await _ctx.Users.FindAsync(id);
            if (user is null || user.Role != "Responsable") return null;
            user.IsActive = !user.IsActive;
            if (!user.IsActive)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = null;
            }
            await _ctx.SaveChangesAsync();
            return user.IsActive;
        }

        // Supprimer
        public async Task<bool> DeleteResponsableAsync(Guid id)
        {
            var user = await _ctx.Users.FindAsync(id);
            if (user is null || user.Role != "Responsable") return false;
            _ctx.Users.Remove(user);
            await _ctx.SaveChangesAsync();
            return true;
        }

        public async Task<List<UserDto>> GetClientsAsync()
        {
            var now = DateTime.UtcNow;
            return await _ctx.Users
                .Where(u => u.Role == "Client")
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    IsActive = _ctx.Abonnements
                        .Any(a => a.UserId == u.Id && a.IsActive && a.DateFin > now)
                })
                .ToListAsync();
        }
    }
}
