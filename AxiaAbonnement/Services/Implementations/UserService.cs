using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Users;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Models.Enums;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AxiaAbonnement.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _ctx;

        public UserService(AppDbContext ctx) => _ctx = ctx;

        public async Task<List<UserDto>> GetResponsablesAsync() =>
            await _ctx.Users
                .Where(u => u.Role == UserRole.Responsable)
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    IsActive = u.IsActive,
                    ProfileImageUrl = u.ProfileImageUrl,
                    CreatedAt = u.CreatedAt,
                    NombreAbonnes = _ctx.Abonnements
                        .Count(a => a.IsActive && a.Service != null && a.Service.ResponsableId == u.Id)
                })
                .ToListAsync();


        public async Task<User?> CreateResponsableAsync(CreateResponsableDto dto)
        {
            if (await _ctx.Users.AnyAsync(u => u.Email == dto.Email)) return null;

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = dto.Username,
                Email = dto.Email,
                Role = UserRole.Responsable,
                IsActive = true,
                Statut = StatutCompte.Active
            };
            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, dto.Password);
            _ctx.Users.Add(user);
            await _ctx.SaveChangesAsync();
            return user;
        }

        public async Task<bool> UpdateResponsableAsync(Guid id, UpdateResponsableDto dto)
        {
            var user = await _ctx.Users.FindAsync(id);
            if (user is null || user.Role != UserRole.Responsable) return false;

            if (!string.IsNullOrWhiteSpace(dto.Username))
                user.Username = dto.Username;

            if (!string.IsNullOrWhiteSpace(dto.Email))
                user.Email = dto.Email;

            if (dto.PhoneNumber is not null)
                user.PhoneNumber = dto.PhoneNumber;

            await _ctx.SaveChangesAsync();
            return true;
        }

        public async Task<bool?> ToggleResponsableAsync(Guid id)
        {
            var user = await _ctx.Users.FindAsync(id);
            if (user is null || user.Role != UserRole.Responsable) return null;

            user.IsActive = !user.IsActive;

            // ✅ RefreshTokenHash au lieu de RefreshToken
            if (!user.IsActive)
            {
                user.RefreshTokenHash = null;
                user.RefreshTokenExpiryTime = null;
            }

            await _ctx.SaveChangesAsync();
            return user.IsActive;
        }

        public async Task<bool> DeleteResponsableAsync(Guid id)
        {
            var user = await _ctx.Users.FindAsync(id);
            if (user is null || user.Role != UserRole.Responsable) return false;
            _ctx.Users.Remove(user);
            await _ctx.SaveChangesAsync();
            return true;
        }

        public async Task<List<UserDto>> GetClientsAsync()
        {
            var now = DateTime.UtcNow;
            return await _ctx.Users
                .Where(u => u.Role == UserRole.Client)
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
        public async Task<List<UserDto>> GetClientsByResponsableAsync(Guid responsableId)
        {
            var now = DateTime.UtcNow;

            var mesServiceIds = await _ctx.Services
                .Where(s => s.ResponsableId == responsableId)
                .Select(s => s.Id)
                .ToListAsync();

            var mesClientIds = await _ctx.Abonnements
                .Where(a =>
                    (a.ServiceId.HasValue && mesServiceIds.Contains(a.ServiceId.Value)) ||
                    (a.OffreId.HasValue && a.Offre!.ServiceOffres.Any(so => mesServiceIds.Contains(so.ServiceId)))
                )
                .Select(a => a.UserId)
                .Distinct()
                .ToListAsync();

            return await _ctx.Users
                .Where(u => mesClientIds.Contains(u.Id))
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