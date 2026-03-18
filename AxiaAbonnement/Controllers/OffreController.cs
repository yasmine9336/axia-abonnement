using AxiaAbonnement.Models.DTOs.Offres;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AxiaAbonnement.Controllers
{
    [ApiController]
    [Route("api/offres")]
    public class OffreController : ControllerBase
    {
        private readonly IOffreService _offreService;
        public OffreController(IOffreService offreService)
        {
            _offreService = offreService;
        }

        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var offres = await _offreService.GetAllOffresAsync();
            return Ok(offres);
        }

        [HttpGet("public")]
        public async Task<IActionResult> GetPublic()
        {
            var offres = await _offreService.GetPublicOffresAsync();
            return Ok(offres);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            var offre = await _offreService.GetOffreByIdAsync(id);
            if (offre == null) return NotFound();
            return Ok(offre);
        }

        [HttpPost]
        [Authorize(Policy ="ResponsableOnly")]
        public async Task<IActionResult> Create([FromBody]CreateOffreDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var offre = await _offreService.CreateOffreAsync(GetUserId(), dto);
            return CreatedAtAction(nameof(GetById), new { id = offre.Id }, offre);
        }

        [HttpPatch("{id}")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOffreDto dto)
        {
            var result = await _offreService.UpdateOffreAsync(id, GetUserId(), dto);
            if (!result) return NotFound("Offre introuvable.");
            return Ok(new { Message = "Offre mise à jour." });
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _offreService.DeleteOffreAsync(id);
            if (!result) return NotFound("Offre introuvable.");
            return Ok(new { Message = "Offre supprimée." });
        }

        [HttpPatch("{id}/toggle")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Toggle(Guid id)
        {
            var result = await _offreService.ToggleOffreAsync(id, GetUserId());
            if (result == null) return NotFound("Offre introuvable.");
            return Ok(new { 
                Message = result == true
                ? "Offre activée avec succès."
                : "Offre désactivée avec succès.",
                IsActive = result.Value
            });
        }
    }
}
