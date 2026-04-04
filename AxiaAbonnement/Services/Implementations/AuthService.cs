using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Auth;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
namespace AxiaAbonnement.Services.Implementations
{

    public class AuthService : IAuthService
    {
        private readonly AppDbContext _ctx;
        private readonly IConfiguration _cfg;
        private readonly IEmailSender _emailSender;
        private readonly INotificationService _notifService;

        public AuthService(AppDbContext ctx, IConfiguration cfg, IEmailSender emailSender, INotificationService notifService)
        { _ctx = ctx; _cfg = cfg; _emailSender = emailSender; _notifService = notifService; }

        //inscription
        public async Task<User?> RegisterAsync(RegisterDto dto)
        {
            if (await _ctx.Users.AnyAsync(u => u.Email == dto.Email)) return null;
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = dto.Username,
                Email = dto.Email,
                Role = "Client"
            };
            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, dto.Password);
            _ctx.Users.Add(user);
            await _ctx.SaveChangesAsync();

            await _notifService.SendAsync(
                user.Id,
                $"Bienvenue {user.Username} ! Votre compte a été créé avec succès. Explorez nos services et offres dès maintenant.",
                "success"
            );

            // Notifier tous les responsables
            var responsables = await _ctx.Users
                .Where(u => u.Role == "Responsable" && u.IsActive)
                .ToListAsync();

            foreach (var resp in responsables)
            {
                await _notifService.SendAsync(
                    resp.Id,
                    $"Nouveau client inscrit : {user.Username} ({user.Email}).",
                    "info"
                );
            }

            return user;

        }

        //connexion
        public async Task<TokenResponseDto?> LoginAsync(LoginDto dto)
        {
            var user = await _ctx.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user is null) return null;
            if (!user.IsActive) return null;
            var check = new PasswordHasher<User>()
                .VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            if (check == PasswordVerificationResult.Failed) return null;
            return await BuildTokenResponseAsync(user, dto.RememberMe);
        }

        //refresh token
        public async Task<TokenResponseDto?> RefreshTokenAsync(RefreshTokenDto dto)
        {
            var user = await _ctx.Users.FindAsync(dto.UserId);
            if (user is null || user.RefreshToken != dto.RefreshToken
                || user.RefreshTokenExpiryTime <= DateTime.UtcNow) return null;
            return await BuildTokenResponseAsync(user, rememberMe: true);
        }

        private async Task<TokenResponseDto> BuildTokenResponseAsync(User user, bool rememberMe = false) =>
            new TokenResponseDto
            {
                AccessToken = CreateJwt(user),
                RefreshToken = await SaveRefreshTokenAsync(user, rememberMe),
                Role = user.Role
            };

        private string CreateJwt(User user)
        {
            var claims = new[] {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name,  user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role,  user.Role)
        };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_cfg["AppSettings:Token"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);
            var token = new JwtSecurityToken(
                issuer: _cfg["AppSettings:Issuer"],
                audience: _cfg["AppSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task<string?> SaveRefreshTokenAsync(User user, bool rememberMe)
        {
            if (!rememberMe)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = null;
                await _ctx.SaveChangesAsync();
                return null;
            }

            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            user.RefreshToken = token;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _ctx.SaveChangesAsync();
            return token;
        }

        public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var user = await _ctx.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user is null) return false;

            //Générer un token de réinitialisation
            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            user.ResetPasswordToken = token;
            user.ResetPasswordTokenExpiry = DateTime.UtcNow.AddHours(2);
            await _ctx.SaveChangesAsync();

            //construire le lien
            var resetLink = $"{dto.ClientUri}?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(user.Email)}";

            //Envoyer l'email
            await _emailSender.SendEmailAsync(
                user.Email,
                "Réinitialisation de mot de passe",
                $"<p>Cliquez sur ce lien pour réinitialiser votre mot de passe :</p><a href='{resetLink}'>{resetLink}</a><p>Ce lien expire dans 2 heures.</p>");
            return true;
        }
        public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = await _ctx.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user is null) return false;

            if (user.ResetPasswordToken != dto.Token || user.ResetPasswordTokenExpiry <= DateTime.UtcNow)
                return false;

            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, dto.Password);
            user.ResetPasswordToken = null;
            user.ResetPasswordTokenExpiry = null;
            await _ctx.SaveChangesAsync();
            return true;
        }
    }
}