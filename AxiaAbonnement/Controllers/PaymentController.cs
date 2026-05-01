using AxiaAbonnement.Models.DTOs.Payment;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AxiaAbonnement.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IPdfExportService _pdfExportService;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IPaymentService paymentService, IPdfExportService pdfExportService, ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _pdfExportService = pdfExportService;
            _logger = logger;
        }

        private Guid GetUserId()
        {
            var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(raw, out var id) ? id : Guid.Empty;
        }

        [Authorize(Policy = "ClientOnly")]
        [HttpPost("create-checkout-session")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateSessionDto dto)
        {
            var url = await _paymentService.CreateCheckoutSessionAsync(GetUserId(), dto);
            if (url == null) return BadRequest("Offre ou service invalide ou inactif.");
            return Ok(new { url });
        }

        [Authorize(Policy = "ClientOnly")]
        [HttpPost("create-renewal-session")]
        public async Task<IActionResult> CreateRenewalSession([FromBody] CreateRenewalSessionDto dto)
        {
            var url = await _paymentService.CreateRenewalCheckoutSessionAsync(GetUserId(), dto.AbonnementId);
            if (url == null) return BadRequest("Renouvellement impossible ou demande non acceptée.");
            return Ok(new { url });
        }

        [AllowAnonymous]
        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var signature = Request.Headers["Stripe-Signature"].ToString();
            var webhookSecret = HttpContext.RequestServices
                .GetRequiredService<IConfiguration>()["Stripe:WebhookSecret"]!;

            try
            {
                await _paymentService.HandleWebhookAsync(json, signature, webhookSecret);
                return Ok();
            }
            catch (Stripe.StripeException ex)
            {
                _logger.LogWarning(ex, "Stripe webhook signature validation failed");
                return BadRequest("Invalid webhook signature.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Webhook processing error");
                return StatusCode(500, "An error occurred processing the webhook.");
            }
        }

        [HttpGet("history")]
        [Authorize(Policy = "ClientOnly")]
        public async Task<IActionResult> GetMyPaiements()
        {
            var userId = GetUserId();
            var paiements = await _paymentService.GetMyPaiementsAsync(userId);
            return Ok(paiements);
        }

        [HttpGet("history/all")]
        [Authorize(Policy = "StaffOnly")]
        public async Task<IActionResult> GetAllPaiements()
        {
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (role == "Responsable")
            {
                var paiements = await _paymentService.GetPaiementsByResponsableAsync(GetUserId());
                return Ok(paiements);
            }

            var all = await _paymentService.GetAllPaiementsAsync();
            return Ok(all);
        }

        [Authorize]
        [HttpPost("create-responsable-account-session")]
        public async Task<IActionResult> CreateResponsableAccountSession()
        {
            var dto = new CreateResponsableAccountSessionDto { UserId = GetUserId() };
            var url = await _paymentService.CreateResponsableAccountSessionAsync(dto);
            if (url == null) return BadRequest("Utilisateur responsable introuvable ou non éligible.");
            return Ok(new { url });
        }

        [HttpGet("history/{paymentId:guid}/receipt")]
        [Authorize(Policy = "ClientOnly")]
        public async Task<IActionResult> DownloadReceipt(Guid paymentId)
        {
            var paiement = await _paymentService.GetMyPaiementByIdAsync(GetUserId(), paymentId);
            if (paiement == null)
                return NotFound("Paiement introuvable.");

            if (!string.Equals(paiement.Statut, "completed", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Le reçu est disponible uniquement pour un paiement complété.");

            var clientName = User.FindFirstValue(ClaimTypes.Name) ?? paiement.ClientUsername ?? "Client";
            var clientEmail = User.FindFirstValue(ClaimTypes.Email) ?? paiement.ClientEmail ?? "";

            var bytes = _pdfExportService.GeneratePaymentReceiptPdf(paiement, clientName, clientEmail);

            var safeName = string.IsNullOrWhiteSpace(paiement.IntituleOffre)
                ? "recu_paiement"
                : $"recu_{paiement.IntituleOffre.Replace(" ", "_")}";

            var fileName = $"{safeName}_{paiement.CreatedAt:yyyy-MM-dd}.pdf";

            return File(bytes, "application/pdf", fileName);
        }
    }
}