using AxiaAbonnement.Models.DTOs.Services;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AxiaAbonnement.Controllers
{
    [ApiController]
    [Route("api/services")]
    public class ServiceController : ControllerBase
    {
        private readonly IServiceManager _serviceManager;

        public ServiceController(IServiceManager serviceManager)
        {
            _serviceManager = serviceManager;
        }

        private Guid GetUserId() => 
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET /api/services — accessible par tous les utilisateurs connectés
        [HttpGet]
        [Authorize]
        public async Task<ActionResult> GetAll()
        {
            var currentUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = User.FindFirstValue(ClaimTypes.Role) ?? "";
            var services = await _serviceManager.GetAllServicesAsync(currentUserId, role);
            return Ok(services);
        }

        // GET /api/services/public — sans authentification, seulement les actifs
        [HttpGet("public")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublic()
        {
            var services = await _serviceManager.GetPublicServicesAsync();
            return Ok(services);
        }

        // GET /api/services/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            var service = await _serviceManager.GetServiceByIdAsync(id);
            if (service == null) return NotFound();
            return Ok(service);
        }

        // POST /api/services — Responsable uniquement
        [HttpPost]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Create([FromBody]CreateServiceDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var service = await _serviceManager.CreateServiceAsync(GetUserId(), dto);
            return CreatedAtAction(nameof(GetById), new { id = service.Id }, service);
        }

        // PATCH /api/services/{id} — Responsable uniquement
        [HttpPatch("{id}")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Update(Guid id, [FromBody]UpdateServiceDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _serviceManager.UpdateServiceAsync(id, GetUserId(), dto);
            if (!result) return NotFound("Service introuvable.");
            return Ok(new {Message = "Service modifié avec succès"});
        }

        // DELETE /api/services/{id} — Responsable uniquement
        [HttpDelete("{id}")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _serviceManager.DeleteServiceAsync(id, GetUserId());
            if (!result) return NotFound("Service introuvable ou non autorisé.");
            return Ok(new {Message = "Service supprimé avec succès"});
        }

        // PATCH /api/services/{id}/toggle — Responsable uniquement
        [HttpPatch("{id}/toggle")]
        [Authorize (Policy = "ResponsableOnly")]
        public async Task<IActionResult> Toggle(Guid id)
        {
            var result = await _serviceManager.ToggleServiceAsync(id, GetUserId());
            if (result == null) return NotFound("Service introuvable.");
            return Ok(new {
                Message = result.Value
                ? "Statut du service activé avec succès"
                : "Service désactivé avec succès.",
                IsActive = result.Value
            });

        }

    }
}