using AxiaAbonnement.Models.DTOs.Profile;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AxiaAbonnement.Controllers
{
    [ApiController]
    [Route("api/profile")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;

        public ProfileController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        private Guid GetUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(raw, out var id) ? id : Guid.Empty;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var profile = await _profileService.GetProfileAsync(GetUserId());
            if (profile == null) return NotFound();
            return Ok(profile);
        }

        [HttpPatch]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _profileService.UpdateProfileAsync(GetUserId(), dto);
            if (!result) return BadRequest("Email déjà utilisé par un autre compte.");
            return Ok(new { Message = "Profil mis à jour avec succès." });
        }

        [HttpPatch("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _profileService.ChangePasswordAsync(GetUserId(), dto);
            if (!result) return BadRequest("Mot de passe actuel incorrect.");
            return Ok(new { Message = "Mot de passe modifié avec succès." });
        }

        [HttpPatch("photo")]
        public async Task<IActionResult> UpdatePhoto([FromForm] IFormFile photo)
        {
            if (photo == null || photo.Length == 0)
                return BadRequest("Aucune image reçue.");

            var url = await _profileService.UpdateProfilePhotoAsync(GetUserId(), photo);
            if (url == null) return BadRequest("Image invalide.");

            return Ok(new { profileImageUrl = url, message = "Photo mise à jour." });
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var role = User.FindFirstValue(ClaimTypes.Role) ?? "";
            var stats = await _profileService.GetStatsAsync(GetUserId(), role);
            return Ok(stats);
        }
    }
}