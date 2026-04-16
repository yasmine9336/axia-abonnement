using AxiaAbonnement.Models.DTOs.Feedbacks;

namespace AxiaAbonnement.Services.Interfaces
{
    public interface IFeedbackService
    {
        Task<(bool Ok, string? Error)> AddFeedbackAsync(Guid clientId, CreateFeedbackDto dto);
        Task<List<FeedbackDto>> GetAllFeedbacksAsync();
        Task<bool> ExistsAsync(Guid clientId, Guid abonnementId);
    }
}
