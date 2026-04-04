using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AxiaAbonnement.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notifService;

    public NotificationController(INotificationService notifService)
    {
        _notifService = notifService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUnread()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var notifs = await _notifService.GetUnreadAsync(userId);
        return Ok(notifs.Select(n => new
        {
            id = n.Id,
            message = n.Message,
            type = n.Type,
            createdAt = n.CreatedAt
        }));
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        await _notifService.MarkAsReadAsync(id);
        return NoContent();
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _notifService.MarkAllAsReadAsync(userId);
        return NoContent();
    }
}
