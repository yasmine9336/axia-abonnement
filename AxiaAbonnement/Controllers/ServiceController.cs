using AxiaAbonnement.Models.DTOs.Services;
using AxiaAbonnement.Models.Enums;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AxiaAbonnement.Controllers
{
    [ApiController]
    [Route("api/services")]
    public class ServiceController(IServiceManager serviceManager) : ControllerBase
    {
        private Guid GetUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

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
            var services = await serviceManager.GetAllServicesAsync(GetUserId(), GetUserRole());
            return Ok(services);
        }

        [HttpGet("public")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublic()
        {
            var services = await serviceManager.GetPublicServicesAsync();
            return Ok(services);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id)
        {
            var service = await serviceManager.GetServiceByIdAsync(id);
            if (service == null) return NotFound();
            return Ok(service);
        }

        [HttpPost]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Create([FromBody] CreateServiceDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var service = await serviceManager.CreateServiceAsync(GetUserId(), dto);
            return CreatedAtAction(nameof(GetById), new { id = service.Id }, service);
        }

        [HttpPatch("{id}")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateServiceDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await serviceManager.UpdateServiceAsync(id, GetUserId(), dto);
            if (!result) return NotFound("Service introuvable.");
            return Ok(new { Message = "Service modifié avec succès." });
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await serviceManager.DeleteServiceAsync(id, GetUserId());
            if (!result) return NotFound("Service introuvable ou non autorisé.");
            return Ok(new { Message = "Service supprimé avec succès." });
        }

        [HttpPatch("{id}/toggle")]
        [Authorize(Policy = "ResponsableOnly")]
        public async Task<IActionResult> Toggle(Guid id)
        {
            var result = await serviceManager.ToggleServiceAsync(id, GetUserId());
            if (result == null) return NotFound("Service introuvable.");
            return Ok(new
            {
                Message = result.Value
                    ? "Service activé avec succès."
                    : "Service désactivé avec succès.",
                IsActive = result.Value
            });
        }
    }
}