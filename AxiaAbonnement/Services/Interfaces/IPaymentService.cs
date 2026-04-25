using AxiaAbonnement.Models.DTOs.Payment;

public interface IPaymentService
{
    Task<string?> CreateCheckoutSessionAsync(Guid userId, CreateSessionDto dto);
    Task<string?> CreateRenewalCheckoutSessionAsync(Guid userId, Guid abonnementId);
    Task<string?> CreateResponsableAccountSessionAsync(CreateResponsableAccountSessionDto dto);
    Task HandleWebhookAsync(string json, string stripeSignature, string webhookSecret);
    Task<List<PaiementDto>> GetMyPaiementsAsync(Guid userId);
    Task<List<PaiementDto>> GetAllPaiementsAsync();
    Task<List<PaiementDto>> GetPaiementsByResponsableAsync(Guid responsableId);
    Task<PaiementDto?> GetMyPaiementByIdAsync(Guid userId, Guid paiementId);
}