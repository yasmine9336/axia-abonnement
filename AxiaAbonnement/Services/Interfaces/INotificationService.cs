using AxiaAbonnement.Models.Entities;

namespace AxiaAbonnement.Services.Interfaces;

public interface INotificationService
{
    Task SendAsync(Guid userId, string message, string type = "info");
    Task<List<Notification>> GetUnreadAsync(Guid userId);
    Task<bool> MarkAsReadAsync(Guid notificationId, Guid userId);
    Task MarkAllAsReadAsync(Guid userId);
}
