using AxiaAbonnement.Models.Entities;

namespace AxiaAbonnement.Services.Interfaces;

public interface INotificationService
{
    Task SendAsync(Guid userId, string message, string type = "info");
    Task<List<Notification>> GetUnreadAsync(Guid userId);
    Task MarkAsReadAsync(Guid notificationId);
    Task MarkAllAsReadAsync(Guid userId);
}
