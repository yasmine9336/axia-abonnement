using AxiaAbonnement.Models.Entities;

namespace AxiaAbonnement.Services.Interfaces;

public interface INotificationService
{
    Task SendAsync(Guid userId, string message, string type = "info", string? route = null);
    Task<List<Notification>> GetUnreadAsync(Guid userId);
    Task<List<Notification>> GetRecentAsync(Guid userId, int limit = 50);
    Task<bool> MarkAsReadAsync(Guid notificationId, Guid userId);
    Task MarkAllAsReadAsync(Guid userId);
    Task<bool> DeleteAsync(Guid notificationId, Guid userId);
    Task DeleteAllAsync(Guid userId);
}