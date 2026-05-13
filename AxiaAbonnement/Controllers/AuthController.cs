using AxiaAbonnement.Models.DTOs.Auth;
using AxiaAbonnement.Models.Enums;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.RateLimiting;

namespace AxiaAbonnement.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;
        public AuthController(IAuthService auth) => _auth = auth;

        [EnableRateLimiting("AuthPolicy")]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            ValidateRegisterDto(dto);

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _auth.RegisterAsync(dto);

            if (user is null)
                return BadRequest(new { Message = "Cet email est déjà utilisé." });

            if (user.Role == UserRole.Responsable)
            {
                return Ok(new
                {
                    Message = "Votre demande a été envoyée. Vous recevrez un email une fois qu'elle sera traitée par l'administrateur.",
                    user.Id,
                    user.Username,
                    user.Role,
                    Statut = user.Statut.ToString()
                });
            }

            return Created("", new { user.Id, user.Username, user.Role });
        }


        [EnableRateLimiting("AuthPolicy")]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _auth.LoginAsync(dto);

            // Succès → token
            if (result.Token != null)
                return Ok(result.Token);

            // Erreur : identifiants incorrects
            if (result.ErrorCode == "INVALID")
                return Unauthorized(new { Message = result.Message });

            // Erreurs bloquantes (Pending / Accepted / Rejected)
            return StatusCode(403, new
            {
                Code = result.ErrorCode,
                Message = result.Message,
                UserId = result.UserId
            });
        }


        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto dto)
        {
            var result = await _auth.RefreshTokenAsync(dto);
            if (result is null)
                return Unauthorized(new { Message = "Refresh token invalide ou expiré" });
            return Ok(result);
        }

        [HttpGet("me")]
        [Authorize]
        public IActionResult Me()
        {
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var username = User.FindFirstValue(ClaimTypes.Name);
            var email = User.FindFirstValue(ClaimTypes.Email);
            var role = User.FindFirstValue(ClaimTypes.Role);
            var secteur = User.FindFirstValue("secteurActivite");

            return Ok(new { id, username, email, role, secteurActivite = secteur });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            await _auth.ForgotPasswordAsync(dto);
            return Ok(new { Message = "Si cet email existe, un lien de réinitialisation a été envoyé." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _auth.ResetPasswordAsync(dto);
            if (!result) return BadRequest("Token invalide ou expiré.");
            return Ok(new { Message = "Mot de passe réinitialisé avec succès." });
        }

        private void ValidateRegisterDto(RegisterDto dto)
        {
            if (string.Equals(dto.Role, "Client", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrWhiteSpace(dto.Sexe))
                    ModelState.AddModelError(nameof(dto.Sexe), "Le sexe est obligatoire pour un client.");
            }
            else if (string.Equals(dto.Role, "Responsable", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrWhiteSpace(dto.NomEntreprise))
                    ModelState.AddModelError(nameof(dto.NomEntreprise), "Le nom de l'entreprise est obligatoire.");

                if (string.IsNullOrWhiteSpace(dto.MatriculeFiscal))
                    ModelState.AddModelError(nameof(dto.MatriculeFiscal), "Le matricule fiscal est obligatoire.");

                if (string.IsNullOrWhiteSpace(dto.SecteurActivite))
                    ModelState.AddModelError(nameof(dto.SecteurActivite), "Le secteur d'activité est obligatoire.");

                if (string.IsNullOrWhiteSpace(dto.AdresseProfessionnelle))
                    ModelState.AddModelError(nameof(dto.AdresseProfessionnelle), "L'adresse professionnelle est obligatoire.");
            }
            else
            {
                ModelState.AddModelError(nameof(dto.Role), "Le rôle doit être Client ou Responsable.");
            }
        }
    }
}
