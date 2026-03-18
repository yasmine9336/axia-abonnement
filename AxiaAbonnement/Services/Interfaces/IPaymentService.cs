using AxiaAbonnement.Models.DTOs.Payment;
namespace AxiaAbonnement.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<string?> CreateCheckoutSessionAsync(Guid userId, CreateSessionDto dto);
        Task HandleWebhookAsync(string json, string stripeSignature, string webhookSecret);
    }
}
