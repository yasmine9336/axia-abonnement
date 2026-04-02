using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Profile;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace AxiaAbonnement.Services.Implementations
{
    public class ProfileService : IProfileService
    {
        private readonly AppDbContext _ctx;

        public ProfileService(AppDbContext ctx)
        {
            _ctx = ctx;
        }

        public async Task<ProfileDto?> GetProfileAsync(Guid userId) 
        {
            var user = await _ctx.Users.FindAsync(userId);
            if (user == null) return null;
            return new ProfileDto
            {
                Id=user.Id,
                Username = user.Username,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                ProfileImageUrl = user.ProfileImageUrl
            };
        }

        public async Task<bool> UpdateProfileAsync(Guid userId, UpdateProfileDto dto) 
        {
            var user = await _ctx.Users.FindAsync(userId);
            if (user == null) return false;

            // Vérifier si le nouvel email est déjà utilisé par un autre utilisateur
            if (await _ctx.Users.AnyAsync(u => u.Email == dto.Email && u.Id != userId))
                return false;

            user.Username = dto.Username;
            user.Email = dto.Email;
            user.PhoneNumber = dto.PhoneNumber;
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

            //sauvegarder le nouveau mot de passe
            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, dto.NewPassword);
            await _ctx.SaveChangesAsync();
            return true;
        }

        public async Task<string?> UpdateProfilePhotoAsync(Guid userId, IFormFile photo)
        {
            var user = await _ctx.Users.FindAsync(userId);
            if (user == null) return null;

            // 1) Validation extension
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(photo.FileName).ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(extension) || !allowedExtensions.Contains(extension))
                return null;

            // 2) Validation taille (2 MB)
            const long maxSize = 2 * 1024 * 1024;
            if (photo.Length <= 0 || photo.Length > maxSize)
                return null;

            // 3) Créer dossier wwwroot/uploads/profiles
            var webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadFolder = Path.Combine(webRoot, "uploads", "profiles");
            Directory.CreateDirectory(uploadFolder);

            // 4) Générer nom unique
            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadFolder, fileName);

            // 5) Sauvegarder fichier
            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await photo.CopyToAsync(stream);
            }

            // 6) (Optionnel recommandé) supprimer ancienne image locale
            if (!string.IsNullOrWhiteSpace(user.ProfileImageUrl) &&
                user.ProfileImageUrl.StartsWith("/uploads/profiles/", StringComparison.OrdinalIgnoreCase))
            {
                var oldRelative = user.ProfileImageUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                var oldPath = Path.Combine(webRoot, oldRelative);

                if (File.Exists(oldPath))
                    File.Delete(oldPath);
            }

            // 7) Sauvegarder URL relative en DB
            user.ProfileImageUrl = $"/uploads/profiles/{fileName}";
            await _ctx.SaveChangesAsync();

            return user.ProfileImageUrl;
        }
    }
}
