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

            // Normaliser le rôle
            var role = dto.Role == "Responsable" ? "Responsable" : "Client";

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = dto.Username,
                Email = dto.Email,
                Role = role,
                PhoneNumber = dto.PhoneNumber,
            };
            user.PasswordHash = new PasswordHasher<User>().HashPassword(user, dto.Password);

            if (role == "Responsable")
            {
                // Compte en attente de validation — les infos pros sont obligatoires
                if (string.IsNullOrWhiteSpace(dto.NomEntreprise) ||
                    string.IsNullOrWhiteSpace(dto.MatriculeFiscal) ||
                    string.IsNullOrWhiteSpace(dto.SecteurActivite) ||
                    string.IsNullOrWhiteSpace(dto.AdresseProfessionnelle))
                {
                    return null; // Infos pros manquantes
                }

                user.Statut = StatutCompte.Pending;
                user.NomEntreprise = dto.NomEntreprise;
                user.MatriculeFiscal = dto.MatriculeFiscal;
                user.SecteurActivite = dto.SecteurActivite;
                user.AdresseProfessionnelle = dto.AdresseProfessionnelle;

                _ctx.Users.Add(user);
                await _ctx.SaveChangesAsync();

                // Notifier tous les admins qu'une demande est arrivée
                var admins = await _ctx.Users
                    .Where(u => u.Role == "Admin" && u.Statut == StatutCompte.Active)
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

            // Sinon → Client (comportement actuel)
            user.Statut = StatutCompte.Active;
            _ctx.Users.Add(user);
            await _ctx.SaveChangesAsync();

            await _notifService.SendAsync(
                user.Id,
                $"Bienvenue {user.Username} ! Votre compte a été créé avec succès.",
                "success"
            );

            // Notifier les responsables actifs
            var responsables = await _ctx.Users
                .Where(u => u.Role == "Responsable" && u.Statut == StatutCompte.Active)
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
        public async Task<LoginResultDto> LoginAsync(LoginDto dto)
        {
            var user = await _ctx.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user is null)
                return new LoginResultDto { ErrorCode = "INVALID", Message = "Email ou mot de passe incorrect." };

            var check = new PasswordHasher<User>()
                .VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            if (check == PasswordVerificationResult.Failed)
                return new LoginResultDto { ErrorCode = "INVALID", Message = "Email ou mot de passe incorrect." };

            // Vérifier le statut du compte
            switch (user.Statut)
            {
                case StatutCompte.Pending:
                    return new LoginResultDto
                    {
                        ErrorCode = "PENDING",
                        Message = "Votre demande est en cours d'examen par l'administrateur. Vous recevrez un email dès qu'elle sera traitée."
                    };

                case StatutCompte.Accepted:
                    return new LoginResultDto
                    {
                        ErrorCode = "PAYMENT_REQUIRED",
                        Message = "Votre demande a été acceptée. Veuillez procéder au paiement (500 TND) pour activer votre compte.",
                        UserId = user.Id
                    };

                case StatutCompte.Rejected:
                    return new LoginResultDto
                    {
                        ErrorCode = "REJECTED",
                        Message = string.IsNullOrEmpty(user.MotifRefus)
                            ? "Votre demande a été refusée."
                            : $"Votre demande a été refusée. Motif : {user.MotifRefus}"
                    };

                case StatutCompte.Active:
                    // Vérification complémentaire : l'ancien IsActive peut avoir désactivé le compte
                    if (!user.IsActive)
                        return new LoginResultDto { ErrorCode = "INVALID", Message = "Compte désactivé." };

                    // OK
                    return new LoginResultDto
                    {
                        Token = await BuildTokenResponseAsync(user, dto.RememberMe)
                    };

                default:
                    return new LoginResultDto { ErrorCode = "INVALID", Message = "Statut de compte inconnu." };
            }
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