using AxiaAbonnement.Data;
using AxiaAbonnement.Hubs;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AxiaAbonnement.Services.Implementations;

public class NotificationService(AppDbContext ctx, IHubContext<NotificationHub> hub, ILogger<NotificationService> logger) : INotificationService
{
    private readonly AppDbContext _ctx = ctx;
    private readonly IHubContext<NotificationHub> _hub = hub;
    private readonly ILogger<NotificationService> _logger = logger;

    public async Task SendAsync(Guid userId, string message, string type = "info", string? route = null)
    {
        var notif = new Notification
        {
            UserId = userId,
            Message = message,
            Type = type,
            Route = route
        };
        _ctx.Notifications.Add(notif);
        await _ctx.SaveChangesAsync();

        try
        {
            await _hub.Clients.Group(userId.ToString())
                .SendAsync("ReceiveNotification", new
                {
                    id = notif.Id,
                    message = notif.Message,
                    type = notif.Type,
                    route = notif.Route,
                    isRead = false,
                    createdAt = notif.CreatedAt
                });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "SignalR notification delivery failed for user {UserId}", userId);
        }
    }

    public async Task<List<Notification>> GetUnreadAsync(Guid userId)
    {
        return await _ctx.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();
    }

    public async Task<List<Notification>> GetRecentAsync(Guid userId, int limit = 50)
    {
        return await _ctx.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<bool> MarkAsReadAsync(Guid notificationId, Guid userId)
    {
        var notif = await _ctx.Notifications.FindAsync(notificationId);
        if (notif == null || notif.UserId != userId) return false;
        notif.IsRead = true;
        await _ctx.SaveChangesAsync();
        return true;
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        await _ctx.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
    }

    public async Task<bool> DeleteAsync(Guid notificationId, Guid userId)
    {
        var notif = await _ctx.Notifications.FindAsync(notificationId);
        if (notif == null || notif.UserId != userId) return false;
        _ctx.Notifications.Remove(notif);
        await _ctx.SaveChangesAsync();
        return true;
    }

    public async Task DeleteAllAsync(Guid userId)
    {
        await _ctx.Notifications
            .Where(n => n.UserId == userId)
            .ExecuteDeleteAsync();
    }
}