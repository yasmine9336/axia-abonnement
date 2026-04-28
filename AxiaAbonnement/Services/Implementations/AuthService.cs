using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Auth;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Models.Enums;
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

        public AuthService(
            AppDbContext ctx,
            IConfiguration cfg,
            IEmailSender emailSender,
            INotificationService notifService)
        {
            _ctx = ctx;
            _cfg = cfg;
            _emailSender = emailSender;
            _notifService = notifService;
        }

        // ── Inscription ───────────────────────────────────────────────────
        public async Task<User?> RegisterAsync(RegisterDto dto)
        {
            if (await _ctx.Users.AnyAsync(u => u.Email == dto.Email))
                return null;

            var role = dto.Role == "Responsable" ? UserRole.Responsable : UserRole.Client;

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = dto.Username,
                Email = dto.Email,
                Role = role,
                PhoneNumber = dto.PhoneNumber,
                Gouvernorat = dto.Gouvernorat,
                Ville = dto.Ville,
                DateNaissance = role == UserRole.Client ? dto.DateNaissance : null,
                Sexe = role == UserRole.Client ? dto.Sexe : null,
            };
            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, dto.Password);

            if (role == UserRole.Responsable)
            {
                if (string.IsNullOrWhiteSpace(dto.NomEntreprise) ||
                    string.IsNullOrWhiteSpace(dto.MatriculeFiscal) ||
                    string.IsNullOrWhiteSpace(dto.SecteurActivite) ||
                    string.IsNullOrWhiteSpace(dto.AdresseProfessionnelle))
                    return null;

                user.Statut = StatutCompte.Pending;
                user.NomEntreprise = dto.NomEntreprise;
                user.MatriculeFiscal = dto.MatriculeFiscal;
                user.SecteurActivite = dto.SecteurActivite;
                user.AdresseProfessionnelle = dto.AdresseProfessionnelle;

                _ctx.Users.Add(user);
                await _ctx.SaveChangesAsync();

                var admins = await _ctx.Users
                    .Where(u => u.Role == UserRole.Admin && u.Statut == StatutCompte.Active)
                    .ToListAsync();

                foreach (var admin in admins)
                {
                    await _notifService.SendAsync(
                        admin.Id,
                        $"Nouvelle demande de compte responsable : {user.Username} ({user.NomEntreprise}).",
                        "info"
                    );
                }

                return user;
            }

            // Client
            user.Statut = StatutCompte.Active;
            _ctx.Users.Add(user);
            await _ctx.SaveChangesAsync();

            await _notifService.SendAsync(
                user.Id,
                $"Bienvenue {user.Username} ! Votre compte a été créé avec succès.",
                "success"
            );

            var responsables = await _ctx.Users
                .Where(u => u.Role == UserRole.Responsable && u.Statut == StatutCompte.Active)
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

        // ── Connexion ─────────────────────────────────────────────────────
        public async Task<LoginResultDto> LoginAsync(LoginDto dto)
        {
            var user = await _ctx.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user is null)
                return new LoginResultDto
                {
                    ErrorCode = "INVALID",
                    Message = "Email ou mot de passe incorrect."
                };

            var check = new PasswordHasher<User>()
                .VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            if (check == PasswordVerificationResult.Failed)
                return new LoginResultDto
                {
                    ErrorCode = "INVALID",
                    Message = "Email ou mot de passe incorrect."
                };

            return user.Statut switch
            {
                StatutCompte.Pending => new LoginResultDto
                {
                    ErrorCode = "PENDING",
                    Message = "Votre demande est en cours d'examen par l'administrateur."
                },

                StatutCompte.Accepted => new LoginResultDto
                {
                    ErrorCode = "PAYMENT_REQUIRED",
                    Message = "Votre demande a été acceptée. Veuillez procéder au paiement (500 TND).",
                    UserId = user.Id
                },

                StatutCompte.Rejected => new LoginResultDto
                {
                    ErrorCode = "REJECTED",
                    Message = string.IsNullOrEmpty(user.MotifRefus)
                        ? "Votre demande a été refusée."
                        : $"Votre demande a été refusée. Motif : {user.MotifRefus}"
                },

                StatutCompte.Active when !user.IsActive => new LoginResultDto
                {
                    ErrorCode = "INVALID",
                    Message = "Compte désactivé."
                },

                StatutCompte.Active => await HandleActiveLoginAsync(user, dto),

                _ => new LoginResultDto
                {
                    ErrorCode = "INVALID",
                    Message = "Statut de compte inconnu."
                }
            };
        }

        private async Task<LoginResultDto> HandleActiveLoginAsync(User user, LoginDto dto)
        {

            return new LoginResultDto
            {
                Token = await BuildTokenResponseAsync(user, dto.RememberMe)
            };
        }

        // ── Refresh Token ─────────────────────────────────────────────────
        public async Task<TokenResponseDto?> RefreshTokenAsync(RefreshTokenDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.RefreshToken)) return null;

            var hash = HashToken(dto.RefreshToken);

            var user = await _ctx.Users.FirstOrDefaultAsync(u =>
                u.RefreshTokenHash == hash &&
                u.RefreshTokenExpiryTime > DateTime.UtcNow);

            if (user is null) return null;

            return await BuildTokenResponseAsync(user, rememberMe: true);
        }

        // ── Mot de passe oublié ───────────────────────────────────────────
        public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var user = await _ctx.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user is null) return false;

            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            user.ResetPasswordToken = token;
            user.ResetPasswordTokenExpiry = DateTime.UtcNow.AddHours(2);
            await _ctx.SaveChangesAsync();

            var resetLink = $"{dto.ClientUri}?token={Uri.EscapeDataString(token)}&email={Uri.EscapeDataString(user.Email)}";

            await _emailSender.SendEmailAsync(
                user.Email,
                "Réinitialisation de mot de passe",
                $"<p>Cliquez sur ce lien pour réinitialiser votre mot de passe :</p>" +
                $"<a href='{resetLink}'>{resetLink}</a>" +
                $"<p>Ce lien expire dans 2 heures.</p>"
            );

            return true;
        }

        // ── Réinitialisation mot de passe ─────────────────────────────────
        public async Task<bool> ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = await _ctx.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null) return false;

            var tokenRecu = dto.Token?.Trim() ?? "";
            var tokenBd = user.ResetPasswordToken?.Trim() ?? "";

            if (!string.Equals(tokenRecu, tokenBd, StringComparison.Ordinal) ||
                user.ResetPasswordTokenExpiry <= DateTime.UtcNow)
                return false;

            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, dto.Password);
            user.ResetPasswordToken = null;
            user.ResetPasswordTokenExpiry = null;
            await _ctx.SaveChangesAsync();
            return true;
        }

        // ── Méthodes privées ──────────────────────────────────────────────
        private async Task<TokenResponseDto> BuildTokenResponseAsync(
            User user, bool rememberMe = false) =>
            new TokenResponseDto
            {
                AccessToken = CreateJwt(user),
                RefreshToken = await SaveRefreshTokenAsync(user, rememberMe),
                Role = user.Role.ToString()
            };

        private string CreateJwt(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_cfg["AppSettings:Token"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            var token = new JwtSecurityToken(
                issuer: _cfg["AppSettings:Issuer"],
                audience: _cfg["AppSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task<string?> SaveRefreshTokenAsync(User user, bool rememberMe)
        {
            var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            user.RefreshTokenHash = HashToken(rawToken);
            user.RefreshTokenExpiryTime = rememberMe
                ? DateTime.UtcNow.AddDays(30)
                : DateTime.UtcNow.AddDays(1);
            await _ctx.SaveChangesAsync();
            return rawToken;
        }

        private static string HashToken(string token)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(bytes);
        }
    }
}