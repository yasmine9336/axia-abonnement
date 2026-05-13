using AxiaAbonnement.Models.DTOs.Offres;
using AxiaAbonnement.Models.Enums;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AxiaAbonnement.Controllers
{
    [ApiController]
    [Route("api/offres")]
    public class OffreController(IOffreService offreService) : ControllerBase
    {
        private Guid GetUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(raw, out var id) ? id : Guid.Empty;
        }

        // ✅ Parser le rôle string → UserRole
        private UserRole GetUserRole()
        {
            var roleStr = User.FindFirstValue(ClaimTypes.Role) ?? "";
            return Enum.TryParse<UserRole>(roleStr, out var role) ? role : UserRole.Client;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var offres = await offreService.GetAllOffresAsync(GetUserId(), GetUserRole());
            return Ok(offres);
        }

        [HttpGet("public")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublic()
        {
            var offres = await offreService.GetPublicOffresAsync();
            return Ok(offres);
        }

        [HttpGet("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            var offre = await offreService.GetOffreByIdAsync(id);
            if (offre == null) return NotFound();
            return Ok(offre);
        }

        [HttpPost]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Create([FromBody] CreateOffreDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var offre = await offreService.CreateOffreAsync(GetUserId(), dto);
            return CreatedAtAction(nameof(GetById), new { id = offre.Id }, offre);
        }

        [HttpPatch("{id:guid}")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOffreDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await offreService.UpdateOffreAsync(id, GetUserId(), dto);
            if (!result) return NotFound("Offre introuvable.");
            return Ok(new { Message = "Offre mise à jour." });
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await offreService.DeleteOffreAsync(id, GetUserId());
            if (!result) return NotFound("Offre introuvable.");
            return Ok(new { Message = "Offre supprimée." });
        }


        [HttpPatch("{id:guid}/toggle")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Toggle(Guid id)
        {
            var result = await offreService.ToggleOffreAsync(id, GetUserId());
            if (result == null) return NotFound("Offre introuvable.");
            return Ok(new
            {
                Message = result.Value
                    ? "Offre activée avec succès."
                    : "Offre désactivée avec succès.",
                IsActive = result.Value
            });
        }
    }
}