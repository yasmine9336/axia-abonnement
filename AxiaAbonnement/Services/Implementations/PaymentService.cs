using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Payment;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;

namespace AxiaAbonnement.Services.Implementations
{
    public class PaymentService : IPaymentService
    {
        private const decimal ResponsableAccountFee = 500m;

        private readonly AppDbContext _ctx;
        private readonly IConfiguration _config;
        private readonly IEmailSender _emailSender;
        private readonly StripeClient _stripeClient;
        private readonly INotificationService _notifService;

        public PaymentService(
            AppDbContext ctx,
            IConfiguration config,
            IEmailSender emailSender,
            INotificationService notifService)
        {
            _ctx = ctx;
            _config = config;
            _emailSender = emailSender;
            _notifService = notifService;
            _stripeClient = new StripeClient(_config["Stripe:SecretKey"]);
        }

        // Paiement abonnement client
        public async Task<string?> CreateCheckoutSessionAsync(Guid userId, CreateSessionDto dto)
        {
            if (dto.OffreId == null && dto.ServiceId == null) return null;
            if (dto.OffreId != null && dto.ServiceId != null) return null;

            var user = await _ctx.Users.FindAsync(userId);
            if (user == null) return null;

            string productName;
            string productDescription;
            decimal montant;

            if (dto.OffreId != null)
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
                { "type", dto.Type },
                { "paymentType", "subscription" }
            };

            if (dto.OffreId != null)
                metadata.Add("offreId", dto.OffreId.Value.ToString());
            else
                metadata.Add("serviceId", dto.ServiceId!.Value.ToString());

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = ["card"],
                LineItems =
                [
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "tnd",
                            UnitAmount = (long)(montant * 100),
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = productName,
                                Description = productDescription
                            }
                        },
                        Quantity = 1
                    }
                ],
                Mode = "payment",
                SuccessUrl = $"{_config["Frontend:Url"]}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = $"{_config["Frontend:Url"]}/payment/cancel",
                Metadata = metadata
            };

            var sessionService = new SessionService(_stripeClient);
            var session = await sessionService.CreateAsync(options);
            return session.Url;
        }

        // Paiement compte responsable
        public async Task<string?> CreateResponsableAccountSessionAsync(CreateResponsableAccountSessionDto dto)
        {
            var user = await _ctx.Users.FindAsync(dto.UserId);
            if (user == null || user.Role != "Responsable") return null;

            var metadata = new Dictionary<string, string>
            {
                { "userId", user.Id.ToString() },
                { "paymentType", "responsable-account" }
            };

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = ["card"],
                LineItems =
                [
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "tnd",
                            UnitAmount = (long)(ResponsableAccountFee * 100),
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = "Activation compte Responsable",
                                Description = "Paiement one-shot pour activer le compte responsable"
                            }
                        },
                        Quantity = 1
                    }
                ],
                Mode = "payment",
                SuccessUrl = $"{_config["Frontend:Url"]}/payment/responsable-account/success?session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = $"{_config["Frontend:Url"]}/payment/responsable-account/cancel",
                Metadata = metadata
            };

            var sessionService = new SessionService(_stripeClient);
            var session = await sessionService.CreateAsync(options);
            return session.Url;
        }

        public async Task HandleWebhookAsync(string json, string stripeSignature, string webhookSecret)
        {
            var stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, webhookSecret);

            if (stripeEvent.Type != EventTypes.CheckoutSessionCompleted) return;
            if (stripeEvent.Data.Object is not Session session) return;

            var paymentType = session.Metadata.TryGetValue("paymentType", out var pType)
                ? pType
                : "subscription";

            if (paymentType == "responsable-account")
            {
                await HandleResponsableAccountPaymentAsync(session);
            }
            else
            {
                await HandleSubscriptionPaymentAsync(session);
            }
        }

        private async Task HandleSubscriptionPaymentAsync(Session session)
        {
            var userId = Guid.Parse(session.Metadata["userId"]);
            var type = session.Metadata["type"];

            var user = await _ctx.Users.FindAsync(userId);
            if (user == null) return;

            Guid? offreId = session.Metadata.TryGetValue("offreId", out var rawOffre)
                ? Guid.Parse(rawOffre)
                : null;

            Guid? serviceId = session.Metadata.TryGetValue("serviceId", out var rawService)
                ? Guid.Parse(rawService)
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

            var dateDebut = DateTime.UtcNow;
            var dateFin = type == "annuel"
                ? dateDebut.AddYears(1)
                : dateDebut.AddMonths(1);

            var abonnement = new Abonnement
            {
                UserId = userId,
                OffreId = offreId,
                ServiceId = serviceId,
                Type = type,
                Montant = montant,
                DateDebut = dateDebut,
                DateFin = dateFin,
                StripeSessionId = session.Id,
                IsActive = true
            };
            _ctx.Abonnements.Add(abonnement);

            // NOTE: si Paiement n'a pas encore UserId/PaymentType, retire ces 2 champs
            var paiement = new Paiement
            {
                AbonnementId = abonnement.Id,
                Montant = montant,
                Statut = "completed",
                StripePaymentIntentId = session.PaymentIntentId
                // UserId = userId,
                // PaymentType = "subscription"
            };
            _ctx.Paiements.Add(paiement);

            await _ctx.SaveChangesAsync();

            await _emailSender.SendEmailAsync(
                user.Email,
                "Confirmation de votre abonnement - AxiaAbonnement",
                $@"Bonjour {user.Username},
                   <p>Votre abonnement <strong>{productName}</strong> est maintenant actif.</p>
                   <p>Type : {type} | Montant : {montant} TND</p>
                   <p>Valable jusqu'au : {dateFin:dd/MM/yyyy}</p>");

            await _notifService.SendAsync(
                user.Id,
                $"Votre abonnement \"{productName}\" est maintenant actif.",
                "success");

            var responsables = await _ctx.Users
                .Where(u => u.Role == "Responsable" && u.IsActive)
                .ToListAsync();

            foreach (var resp in responsables)
            {
                await _notifService.SendAsync(
                    resp.Id,
                    $"Nouveau paiement : {user.Username} a souscrit à \"{productName}\" ({montant} TND - {type}).",
                    "info");
            }
        }

        private async Task HandleResponsableAccountPaymentAsync(Session session)
        {
            var userId = Guid.Parse(session.Metadata["userId"]);
            var user = await _ctx.Users.FindAsync(userId);
            if (user == null || user.Role != "Responsable") return;

            // Nécessite ces champs dans User:
            // - StatutCompte (string)
            // - DatePaiementCompte (DateTime?)
            user.Statut = StatutCompte.Active;
            user.DatePaiementCompte = DateTime.UtcNow;
            user.IsActive = true;

            // Optionnel selon ton modèle Paiement actuel
            var paiement = new Paiement
            {
                // AbonnementId = null, // si nullable dans ton modèle
                Montant = ResponsableAccountFee,
                Statut = "completed",
                StripePaymentIntentId = session.PaymentIntentId
                // UserId = userId,
                // PaymentType = "responsable-account"
            };
            _ctx.Paiements.Add(paiement);

            await _ctx.SaveChangesAsync();

            var admins = await _ctx.Users
                .Where(u => u.Role == "Admin" && u.IsActive)
                .ToListAsync();

            foreach (var admin in admins)
            {
                await _notifService.SendAsync(
                    admin.Id,
                    $"Nouveau responsable actif : {user.Username}.",
                    "info");
            }
        }

        public async Task<List<PaiementDto>> GetMyPaiementsAsync(Guid userId)
        {
            return await _ctx.Paiements
                .Include(p => p.Abonnement).ThenInclude(a => a!.Offre)
                .Include(p => p.Abonnement).ThenInclude(a => a!.Service)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PaiementDto
                {
                    Id = p.Id,
                    Montant = p.Montant,
                    Statut = p.Statut,
                    CreatedAt = p.CreatedAt,
                    IntituleOffre = p.Abonnement != null && p.Abonnement.Offre != null
                        ? p.Abonnement.Offre.IntituleOffre
                        : p.Abonnement != null && p.Abonnement.Service != null
                            ? p.Abonnement.Service.IntituleService
                            : "Activation compte responsable",
                    TypeAbonnement = p.Abonnement != null
                        ? p.Abonnement.Type
                        : "responsable-account"
                })
                .ToListAsync();
        }

        public async Task<List<PaiementDto>> GetAllPaiementsAsync()
        {
            return await _ctx.Paiements
                .Include(p => p.Abonnement).ThenInclude(a => a!.Offre)
                .Include(p => p.Abonnement).ThenInclude(a => a!.Service)
                .Include(p => p.User)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PaiementDto
                {
                    Id = p.Id,
                    Montant = p.Montant,
                    Statut = p.Statut,
                    CreatedAt = p.CreatedAt,
                    IntituleOffre = p.Abonnement != null && p.Abonnement.Offre != null
                        ? p.Abonnement.Offre.IntituleOffre
                        : p.Abonnement != null && p.Abonnement.Service != null
                            ? p.Abonnement.Service.IntituleService
                            : "Activation compte responsable",
                    TypeAbonnement = p.Abonnement != null
                        ? p.Abonnement.Type
                        : "responsable-account",
                    ClientUsername = p.User.Username,
                    ClientEmail = p.User.Email
                })
                .ToListAsync();
        }
    }
}