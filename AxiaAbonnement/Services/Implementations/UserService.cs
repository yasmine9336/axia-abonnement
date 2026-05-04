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

            var users = await _ctx.Users
                .Where(u => u.Role == UserRole.Client)
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            var userIds = users.Select(u => u.Id).ToList();

            var abonnements = await _ctx.Abonnements
                .Include(a => a.Offre)
                .Include(a => a.Service).ThenInclude(s => s!.Responsable)
                .Include(a => a.Offre).ThenInclude(o => o!.ServiceOffres)
                    .ThenInclude(so => so.Service).ThenInclude(s => s.Responsable)
                .Where(a => userIds.Contains(a.UserId))
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            var dernierAbo = abonnements
                .GroupBy(a => a.UserId)
                .ToDictionary(g => g.Key, g => g.First());

            return users.Select(u =>
            {
                dernierAbo.TryGetValue(u.Id, out var abo);
                return new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    CreatedAt = u.CreatedAt,
                    IsActive = abo != null && abo.DateFin > now,
                    AbonnementActif = abo?.Offre?.IntituleOffre ?? abo?.Service?.IntituleService,
                    MontantActif = abo?.Montant,
                    StatutAbonnement = abo == null ? null : abo.DateFin < now ? "expiré" : "actif",
                    ResponsableUsername = abo?.Service?.Responsable?.Username
                        ?? abo?.Offre?.ServiceOffres.FirstOrDefault()?.Service?.Responsable?.Username
                };
            }).ToList();
        }

        public async Task<List<UserDto>> GetClientsByResponsableAsync(Guid responsableId)
        {
            var now = DateTime.UtcNow;

            var mesServiceIds = await _ctx.Services
                .Where(s => s.ResponsableId == responsableId)
                .Select(s => s.Id)
                .ToListAsync();

            var mesOffresIds = await _ctx.ServiceOffres
                .Where(so => mesServiceIds.Contains(so.ServiceId))
                .Select(so => so.OffreId)
                .Distinct()
                .ToListAsync();

            var abonnements = await _ctx.Abonnements
                .Include(a => a.Offre)
                .Include(a => a.Service).ThenInclude(s => s!.Responsable)
                .Include(a => a.Offre).ThenInclude(o => o!.ServiceOffres)
                    .ThenInclude(so => so.Service).ThenInclude(s => s.Responsable)
                .Include(a => a.User)
                .Where(a =>
                    (a.ServiceId.HasValue && mesServiceIds.Contains(a.ServiceId.Value)) ||
                    (a.OffreId.HasValue && mesOffresIds.Contains(a.OffreId.Value))
                )
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            var dernierAbo = abonnements
                .GroupBy(a => a.UserId)
                .ToDictionary(g => g.Key, g => g.First());

            var userIds = dernierAbo.Keys.ToList();

            var users = await _ctx.Users
                .Where(u => userIds.Contains(u.Id))
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            return users.Select(u =>
            {
                dernierAbo.TryGetValue(u.Id, out var abo);
                return new UserDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    CreatedAt = u.CreatedAt,
                    IsActive = abo != null && abo.DateFin > now,
                    AbonnementActif = abo?.Offre?.IntituleOffre ?? abo?.Service?.IntituleService,
                    MontantActif = abo?.Montant,
                    StatutAbonnement = abo == null ? null : abo.DateFin < now ? "expiré" : "actif",
                    ResponsableUsername = abo?.Service?.Responsable?.Username
                        ?? abo?.Offre?.ServiceOffres.FirstOrDefault()?.Service?.Responsable?.Username
                };
            }).ToList();
        }
    }
}