using AxiaAbonnement.Data;
using AxiaAbonnement.Hubs;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace AxiaAbonnement.Services.Implementations;

public class NotificationService(AppDbContext ctx, IHubContext<NotificationHub> hub) : INotificationService
{
    private readonly AppDbContext _ctx = ctx;
    private readonly IHubContext<NotificationHub> _hub = hub;

    public async Task SendAsync(Guid userId, string message, string type = "info")
    {
        // Persister en base
        var notif = new Notification
        {
            UserId = userId,
            Message = message,
            Type = type
        };
        _ctx.Notifications.Add(notif);
        await _ctx.SaveChangesAsync();

        // Envoyer en temps réel si l'utilisateur est connecté
        try
        {
            await _hub.Clients.Group(userId.ToString())
                .SendAsync("ReceiveNotification", new
                {
                    id = notif.Id,
                    message = notif.Message,
                    type = notif.Type,
                    createdAt = notif.CreatedAt
                });
        }
        catch { }

    }

    public async Task<List<Notification>> GetUnreadAsync(Guid userId)
    {
        return await _ctx.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> MarkAsReadAsync(Guid notificationId)
    {
        var notif = await _ctx.Notifications.FindAsync(notificationId);
        if (notif == null) return false;
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
}
