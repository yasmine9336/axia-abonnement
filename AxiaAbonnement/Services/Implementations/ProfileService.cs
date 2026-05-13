using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Profile;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Models.Enums;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AxiaAbonnement.Services.Implementations
{
    public class ProfileService : IProfileService
    {
        private readonly AppDbContext _ctx;

        public ProfileService(AppDbContext ctx) => _ctx = ctx;

        public async Task<ProfileDto?> GetProfileAsync(Guid userId)
        {
            var user = await _ctx.Users.FindAsync(userId);
            if (user == null) return null;

            return new ProfileDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role.ToString(),
                ProfileImageUrl = user.ProfileImageUrl,
                NomEntreprise = user.NomEntreprise,
                MatriculeFiscal = user.MatriculeFiscal,
                SecteurActivite = user.SecteurActivite,
                AdresseProfessionnelle = user.AdresseProfessionnelle,
                CreatedAt = user.CreatedAt,
                Gouvernorat = user.Gouvernorat,
                Ville = user.Ville,
                DateNaissance = user.DateNaissance,
                Sexe = user.Sexe,
            };
        }

        public async Task<bool> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
        {
            var user = await _ctx.Users.FindAsync(userId);
            if (user == null) return false;

            if (await _ctx.Users.AnyAsync(u => u.Email == dto.Email && u.Id != userId))
                return false;

            user.Username = dto.Username;
            user.Email = dto.Email;
            user.PhoneNumber = dto.PhoneNumber;
            user.Gouvernorat = dto.Gouvernorat;
            user.Ville = dto.Ville;
            await _ctx.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
        {
            var user = await _ctx.Users.FindAsync(userId);
            if (user == null) return false;

            var check = new PasswordHasher<User>()
                .VerifyHashedPassword(user, user.PasswordHash, dto.CurrentPassword);

            if (check == PasswordVerificationResult.Failed) return false;

            user.PasswordHash = new PasswordHasher<User>()
                .HashPassword(user, dto.NewPassword);
            await _ctx.SaveChangesAsync();
            return true;
        }

        public async Task<string?> UpdateProfilePhotoAsync(Guid userId, IFormFile photo)
        {
            var user = await _ctx.Users.FindAsync(userId);
            if (user == null) return null;

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(photo.FileName).ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(extension) || !allowedExtensions.Contains(extension))
                return null;

            const long maxSize = 2 * 1024 * 1024;
            if (photo.Length <= 0 || photo.Length > maxSize)
                return null;

            var buffer = new byte[4];
            await using (var stream = photo.OpenReadStream())
            {
                var read = await stream.ReadAsync(buffer, 0, 4);
                if (read < 4) return null;
            }

            var isJpeg = buffer[0] == 0xFF && buffer[1] == 0xD8 && buffer[2] == 0xFF;
            var isPng = buffer[0] == 0x89 && buffer[1] == 0x50 && buffer[2] == 0x4E && buffer[3] == 0x47;
            var isWebp = buffer[0] == 0x52 && buffer[1] == 0x49 && buffer[2] == 0x46 && buffer[3] == 0x46;

            if (!isJpeg && !isPng && !isWebp) return null;

            var webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadFolder = Path.Combine(webRoot, "uploads", "profiles");
            Directory.CreateDirectory(uploadFolder);

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadFolder, fileName);

            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await photo.CopyToAsync(stream);
            }

            if (!string.IsNullOrWhiteSpace(user.ProfileImageUrl) &&
                user.ProfileImageUrl.StartsWith("/uploads/profiles/", StringComparison.OrdinalIgnoreCase))
            {
                var oldRelative = user.ProfileImageUrl
                    .TrimStart('/')
                    .Replace('/', Path.DirectorySeparatorChar);
                var oldPath = Path.Combine(webRoot, oldRelative);

                if (File.Exists(oldPath))
                    File.Delete(oldPath);
            }

            user.ProfileImageUrl = $"/uploads/profiles/{fileName}";
            await _ctx.SaveChangesAsync();
            return user.ProfileImageUrl;
        }

        public async Task<ProfileStatsDto> GetStatsAsync(Guid userId, string role)
        {
            var now = DateTime.UtcNow;

            if (role == "Admin")
            {
                var debutMois = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                return new ProfileStatsDto
                {
                    NombreResponsables = await _ctx.Users.CountAsync(u => u.Role == UserRole.Responsable),
                    NombreClients = await _ctx.Users.CountAsync(u => u.Role == UserRole.Client),
                    AbonnementsActifs = await _ctx.Abonnements.CountAsync(a => a.Statut == StatutAbonnement.Actif),
                    RevenusMois = await _ctx.Paiements
                        .Where(p => p.Statut == "completed" && p.CreatedAt >= debutMois)
                        .SumAsync(p => (decimal?)p.Montant) ?? 0,
                    NombreServices = await _ctx.Services.CountAsync(),
                    NombreOffres = await _ctx.Offres.CountAsync(),
                };
            }

            if (role == "Responsable")
            {
                var debutMois = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

                var mesServiceIds = await _ctx.Services
                    .Where(s => s.ResponsableId == userId)
                    .Select(s => s.Id)
                    .ToListAsync();

                var mesOffresIds = await _ctx.ServiceOffres
                    .Where(so => mesServiceIds.Contains(so.ServiceId))
                    .Select(so => so.OffreId)
                    .Distinct()
                    .ToListAsync();

                var baseAbos = _ctx.Abonnements.Where(a =>
                    (a.ServiceId.HasValue && mesServiceIds.Contains(a.ServiceId.Value)) ||
                    (a.OffreId.HasValue && mesOffresIds.Contains(a.OffreId.Value))
                );

                var mesOffres = await _ctx.Offres
                    .CountAsync(o => o.ServiceOffres.Any(so => mesServiceIds.Contains(so.ServiceId)));

                var revenusMois = await _ctx.Paiements
                    .Where(p => p.Statut == "completed"
                             && p.AbonnementId.HasValue
                             && p.CreatedAt >= debutMois
                             && baseAbos.Any(a => a.Id == p.AbonnementId!.Value))
                    .SumAsync(p => (decimal?)p.Montant) ?? 0;

                var mesClients = await baseAbos
                    .Select(a => a.UserId)
                    .Distinct()
                    .CountAsync();

                return new ProfileStatsDto
                {
                    MesServices = mesServiceIds.Count,
                    MesOffres = mesOffres,
                    MesClients = mesClients,
                    AbonnementsActifs = await baseAbos.CountAsync(a => a.Statut == StatutAbonnement.Actif),
                    RevenusMois = revenusMois,
                };
            }

            // Client
            return new ProfileStatsDto
            {
                AbonnementsActifs = await _ctx.Abonnements.CountAsync(a =>
                    a.UserId == userId && a.Statut == StatutAbonnement.Actif),
                AbonnementsExpires = await _ctx.Abonnements.CountAsync(a =>
                    a.UserId == userId && a.Statut == StatutAbonnement.Expiré),
                TotalPaye = await _ctx.Paiements
                    .Where(p => p.UserId == userId && p.Statut == "completed")
                    .SumAsync(p => (decimal?)p.Montant) ?? 0
            };
        }
    }
}