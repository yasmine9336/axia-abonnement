using AxiaAbonnement.Models.DTOs.Users;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AxiaAbonnement.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // Staff → consulter clients
        [HttpGet("clients")]
        [Authorize(Policy = "StaffOnly")]
        public async Task<IActionResult> GetClients()
        {
            var clients = await _userService.GetClientsAsync();
            return Ok(clients);
        }

        // Admin → liste responsables
        [HttpGet("responsables")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetResponsables()
        {
            var list = await _userService.GetResponsablesAsync();
            return Ok(list);
        }

        // Admin → créer responsable
        [HttpPost("responsables")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> CreateResponsable([FromBody] CreateResponsableDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var user = await _userService.CreateResponsableAsync(dto);
            if (user is null) return BadRequest("Email déjà utilisé.");
            return Created("", new { user.Id, user.Username, user.Email, user.IsActive });
        }

        // Admin → modifier responsable
        [HttpPatch("responsables/{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> UpdateResponsable(Guid id, [FromBody] UpdateResponsableDto dto)
        {
            var result = await _userService.UpdateResponsableAsync(id, dto);
            if (!result) return NotFound("Responsable introuvable.");
            return Ok(new { Message = "Responsable mis à jour." });
        }

        // Admin → activer/désactiver responsable
        [HttpPatch("responsables/{id}/toggle")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ToggleResponsable(Guid id)
        {
            var isActive = await _userService.ToggleResponsableAsync(id);
            if (isActive is null) return NotFound("Responsable introuvable.");
            return Ok(new { Message = isActive.Value ? "Responsable activé." : "Responsable désactivé." });
        }

        // Admin → supprimer responsable
        [HttpDelete("responsables/{id}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteResponsable(Guid id)
        {
            var result = await _userService.DeleteResponsableAsync(id);
            if (!result) return NotFound("Responsable introuvable.");
            return Ok(new { Message = "Responsable supprimé." });
        }
    }
}