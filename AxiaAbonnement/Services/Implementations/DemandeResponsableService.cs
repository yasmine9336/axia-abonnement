using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Auth;
using AxiaAbonnement.Models.Enums;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AxiaAbonnement.Services.Implementations
{
    public class DemandeResponsableService : IDemandeResponsableService
    {
        private readonly AppDbContext _ctx;
        private readonly IEmailSender _emailSender;
        private readonly IConfiguration _cfg;

        public DemandeResponsableService(
            AppDbContext ctx,
            IEmailSender emailSender,
            IConfiguration cfg)
        {
            _ctx = ctx;
            _emailSender = emailSender;
            _cfg = cfg;
        }

        public async Task<List<DemandeResponsableDto>> GetDemandesAsync(string? statut)
        {
            // ✅ UserRole.Responsable au lieu de "Responsable"
            var query = _ctx.Users
                .Where(u => u.Role == UserRole.Responsable &&
                            u.Statut != StatutCompte.Active);

            if (!string.IsNullOrEmpty(statut) &&
                Enum.TryParse<StatutCompte>(statut, true, out var statutEnum))
            {
                query = query.Where(u => u.Statut == statutEnum);
            }

            return await query
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new DemandeResponsableDto
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    NomEntreprise = u.NomEntreprise,
                    MatriculeFiscal = u.MatriculeFiscal,
                    SecteurActivite = u.SecteurActivite,
                    AdresseProfessionnelle = u.AdresseProfessionnelle,
                    Statut = u.Statut.ToString(),
                    CreatedAt = u.CreatedAt,
                    DateAcceptation = u.DateAcceptation,
                    MotifRefus = u.MotifRefus
                })
                .ToListAsync();
        }

        public async Task<bool> AccepterAsync(Guid userId)
        {
            var user = await _ctx.Users.FindAsync(userId);

            // ✅ UserRole.Responsable
            if (user is null || user.Role != UserRole.Responsable) return false;
            if (user.Statut != StatutCompte.Pending) return false;

            user.Statut = StatutCompte.Accepted;
            user.DateAcceptation = DateTime.UtcNow;
            user.MotifRefus = null;
            await _ctx.SaveChangesAsync();

            var frontendUrl = _cfg["AppSettings:FrontendUrl"] ?? "https://localhost:5173";
            var paymentLink = $"{frontendUrl}/payment/responsable-account?userId={user.Id}";

            var subject = "Votre demande de compte responsable a été acceptée";
            var body = $@"
                <h2>Bonjour {user.Username},</h2>
                <p>Nous avons le plaisir de vous informer que votre demande de compte 
                <strong>responsable</strong> sur AxiaAbonnement a été 
                <strong>acceptée</strong> par l'administrateur.</p>
                <p>Pour activer votre compte, veuillez procéder au paiement du droit 
                d'entrée de <strong>500 TND</strong> en cliquant sur le lien ci-dessous :</p>
                <p>
                    <a href=""{paymentLink}""
                       style=""display:inline-block;background-color:#4F46E5;color:white;
                              padding:12px 24px;text-decoration:none;border-radius:8px;
                              font-weight:bold;"">
                        Procéder au paiement
                    </a>
                </p>
                <p>Ou copiez ce lien : <a href=""{paymentLink}"">{paymentLink}</a></p>
                <p>Une fois le paiement effectué, vous pourrez vous connecter et commencer 
                à créer vos services et offres.</p>
                <hr/>
                <p style=""color:#888;font-size:12px;"">
                    Cet email vous a été envoyé automatiquement par AxiaAbonnement.
                </p>
            ";

            await _emailSender.SendEmailAsync(user.Email, subject, body);
            return true;
        }

        public async Task<bool> RefuserAsync(Guid userId, string? motif)
        {
            var user = await _ctx.Users.FindAsync(userId);

            // ✅ UserRole.Responsable
            if (user is null || user.Role != UserRole.Responsable) return false;
            if (user.Statut != StatutCompte.Pending) return false;

            user.Statut = StatutCompte.Rejected;
            user.MotifRefus = string.IsNullOrWhiteSpace(motif) ? null : motif.Trim();
            await _ctx.SaveChangesAsync();

            var subject = "Votre demande de compte responsable";
            var motifBlock = string.IsNullOrEmpty(user.MotifRefus)
                ? ""
                : $"<p><strong>Motif :</strong> {user.MotifRefus}</p>";

            var body = $@"
                <h2>Bonjour {user.Username},</h2>
                <p>Nous vous remercions de l'intérêt porté à la plateforme AxiaAbonnement.</p>
                <p>Après examen de votre demande de compte <strong>responsable</strong>, 
                nous sommes au regret de vous informer qu'elle a été 
                <strong>refusée</strong>.</p>
                {motifBlock}
                <p>Pour toute question, vous pouvez contacter notre support.</p>
                <hr/>
                <p style=""color:#888;font-size:12px;"">AxiaAbonnement</p>
            ";

            await _emailSender.SendEmailAsync(user.Email, subject, body);
            return true;
        }
    }
}