using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Payment;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Services.Interfaces;
using Stripe;
using Stripe.Checkout;
using System.Diagnostics.Eventing.Reader;

namespace AxiaAbonnement.Services.Implementations
{
    public class PaymentService : IPaymentService
    {
        private readonly AppDbContext _ctx;
        private readonly IConfiguration _config;
        private readonly IEmailSender _emailSender;
        private readonly StripeClient _stripeClient;

        public PaymentService(AppDbContext ctx, IConfiguration config, IEmailSender emailSender)
        {
            _ctx = ctx;
            _config = config;
            _emailSender = emailSender;
            _stripeClient = new StripeClient(_config["Stripe:SecretKey"]);
        }

        public async Task<string?> CreateCheckoutSessionAsync(Guid userId, CreateSessionDto dto)
        {
            if (dto.OffreId == null && dto.ServiceId == null) return null;
            if (dto.OffreId != null && dto.ServiceId != null) return null;

            var user = await _ctx.Users.FindAsync(userId);
            if (user == null) return null;
            
            string productName;
            string productDescription;
            decimal montant;

            if(dto.OffreId != null)
            {
                 var offre = await _ctx.Offres.FindAsync(dto.OffreId.Value);
                 if (offre == null || !offre.IsActive) return null;

                 productName = offre.IntituleOffre;
                 productDescription = offre.Description;
                 montant = dto.Type == "annuel" ? offre.ParAnnee : offre.ParMois;
            }
            else
            {
                var service = await _ctx.Services.FindAsync(dto.ServiceId!.Value);
                if (service == null || !service.IsActive) return null;

                productName = service.IntituleService;
                productDescription = service.Description;
                montant = dto.Type == "annuel" ? service.ParAnnee : service.ParMois;
            }
            
            var metadata = new Dictionary<string, string>
            {
                { "userId", userId.ToString() },
                { "type", dto.Type }
            };

            if(dto.OffreId != null)
                metadata.Add("offreId", dto.OffreId.Value.ToString());
            else
                metadata.Add("serviceId", dto.ServiceId!.Value.ToString());

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "eur",
                            UnitAmount = (long)(montant * 100),
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = productName,
                                Description = productDescription
                            }
                        },
                        Quantity = 1
                    }
                },
                Mode = "payment",
                SuccessUrl = $"{_config["Frontend:Url"]}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = $"{_config["Frontend:Url"]}/payment/cancel",
                Metadata = metadata
            };

            var sessionService = new SessionService(_stripeClient);
            var session = await sessionService.CreateAsync(options);
            return session.Url;
        }

        public async Task HandleWebhookAsync(string json, string stripeSignature, string webhookSecret)
        {

            var stripeEvent = EventUtility.ConstructEvent(
                json,
                stripeSignature,
                webhookSecret
            );

            if (stripeEvent.Type == EventTypes.CheckoutSessionCompleted)
            {
                var session = stripeEvent.Data.Object as Session;
                if (session == null) return;

                var userId = Guid.Parse(session.Metadata["userId"]);
                var type = session.Metadata["type"];

                var user = await _ctx.Users.FindAsync(userId);
                if (user == null) return;

                Guid? offreId = session.Metadata.ContainsKey("offreId") 
                    ? Guid.Parse(session.Metadata["offreId"]) 
                    : null;
                Guid? serviceId = session.Metadata.ContainsKey("serviceId") 
                    ? Guid.Parse(session.Metadata["serviceId"]) 
                    : null;

                string productName;
                decimal montant;

                if (offreId != null)
                {
                    var offre = await _ctx.Offres.FindAsync(offreId.Value);
                    if (offre == null) return;
                    productName = offre.IntituleOffre;
                    montant = type == "annuel" ? offre.ParAnnee : offre.ParMois;
                }
                else if (serviceId != null)
                {
                    var service = await _ctx.Services.FindAsync(serviceId.Value);
                    if (service == null) return;
                    productName = service.IntituleService;
                    montant = type == "annuel" ? service.ParAnnee : service.ParMois;
                } 
                else return;
                
                var dateFin = type == "annuel"
                    ? DateTime.UtcNow.AddYears(1)
                    : DateTime.UtcNow.AddMonths(1);

                var abonnement = new Abonnement
                {
                    UserId = userId,
                    OffreId = offreId,
                    ServiceId = serviceId,
                    Type = type,
                    Montant = montant,
                    DateDebut = DateTime.UtcNow,
                    DateFin = dateFin,
                    StripeSessionId = session.Id,
                    IsActive = true
                };
                _ctx.Abonnements.Add(abonnement);

                var paiement = new Paiement
                {
                    AbonnementId = abonnement.Id,
                    Montant = montant,
                    Statut= "completed",
                    StripePaymentIntentId = session.PaymentIntentId
                };
                _ctx.Paiements.Add(paiement);

                await _ctx.SaveChangesAsync();

                await _emailSender.SendEmailAsync(
                    user.Email,
                    "Confirmation de votre abonnement - AxiaAbonnement",
                    $@"Bonjour {user.Username}, </h2>
                    <p>Votre abonnement <strong>{productName}</strong> est maintenant actif.</p>
                    <p>Type : {type} | Montant : {montant} TND</p>
                    <p>Valable jusqu'au : {dateFin:dd/MM/yyyy}</p>
                    <p>Merci de votre confiance !</p>"
                );
            }
        }
    }
}