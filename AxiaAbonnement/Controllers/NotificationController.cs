using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AxiaAbonnement.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationController(INotificationService notifService) : ControllerBase
{
    private readonly INotificationService _notifService = notifService;

    private bool TryGetUserId(out Guid userId) =>
        Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);

    [HttpGet]
    public async Task<IActionResult> GetUnread()
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized("Utilisateur non authentifié");
        var notifs = await _notifService.GetUnreadAsync(userId);
        return Ok(notifs.Select(n => new
        {
            id = n.Id,
            message = n.Message,
            type = n.Type,
            route = n.Route,
            isRead = n.IsRead,
            createdAt = n.CreatedAt
        }));
    }
    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized("Utilisateur non authentifié");
        var success = await _notifService.MarkAsReadAsync(id, userId);
        return success ? NoContent() : NotFound();
    }


    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized("Utilisateur non authentifié");
        await _notifService.MarkAllAsReadAsync(userId);
        return NoContent();
    }
}
