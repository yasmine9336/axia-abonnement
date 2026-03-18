using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Profile;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

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
                Role = user.Role
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
    }
}
