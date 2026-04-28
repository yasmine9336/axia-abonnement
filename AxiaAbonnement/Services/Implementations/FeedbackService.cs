using AxiaAbonnement.Data;
using AxiaAbonnement.Models.DTOs.Feedbacks;
using AxiaAbonnement.Models.Entities;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AxiaAbonnement.Services.Implementations
{
    public class FeedbackService : IFeedbackService
    {
        private readonly AppDbContext _db;
        private readonly INotificationService _notifService;

        public FeedbackService(AppDbContext db, INotificationService notifService)
        {
            _db = db;
            _notifService = notifService;
        }

        public async Task<(bool Ok, string? Error)> AddFeedbackAsync(
            Guid clientId, CreateFeedbackDto dto)
        {
            if (dto.AbonnementId == Guid.Empty)
                return (false, "Abonnement invalide.");

            var abonnement = await _db.Abonnements
                .Include(a => a.Offre)
                .Include(a => a.Service)
                .FirstOrDefaultAsync(a => a.Id == dto.AbonnementId);

            if (abonnement == null)
                return (false, "Abonnement introuvable.");

            if (abonnement.UserId != clientId)
                return (false, "Non autorisé pour cet abonnement.");

            var alreadyExists = await _db.Feedbacks
                .AnyAsync(f => f.ClientId == clientId && f.AbonnementId == dto.AbonnementId);

            if (alreadyExists)
                return (false, "Feedback déjà envoyé pour cet abonnement.");

            var feedback = new Feedback
            {
                ClientId = clientId,
                AbonnementId = dto.AbonnementId,
                Note = dto.Note,
                CreatedAt = DateTime.UtcNow
            };

            _db.Feedbacks.Add(feedback);
            await _db.SaveChangesAsync();

            var client = await _db.Users.FindAsync(clientId);

            // ✅ Notifier uniquement les responsables du service/offre concerné
            var responsableIds = new List<Guid>();

            if (abonnement.ServiceId != null)
            {
                var service = await _db.Services.FindAsync(abonnement.ServiceId.Value);
                if (service?.ResponsableId != null)
                    responsableIds.Add(service.ResponsableId.Value);
            }
            else if (abonnement.OffreId != null)
            {
                var serviceIds = await _db.ServiceOffres
                    .Where(so => so.OffreId == abonnement.OffreId)
                    .Select(so => so.ServiceId)
                    .ToListAsync();

                var respIds = await _db.Services
                    .Where(s => serviceIds.Contains(s.Id) && s.ResponsableId != null)
                    .Select(s => s.ResponsableId!.Value)
                    .Distinct()
                    .ToListAsync();

                responsableIds.AddRange(respIds);
            }

            foreach (var respId in responsableIds)
            {
                await _notifService.SendAsync(
                    respId,
                    $"Nouveau feedback de {client?.Username ?? "un client"} — Note : {dto.Note}/5.",
                    "info"
                );
            }

            return (true, null);
        }

        public async Task<List<FeedbackDto>> GetAllFeedbacksAsync()
        {
            return await _db.Feedbacks
                .Include(f => f.Client)
                .Include(f => f.Abonnement).ThenInclude(a => a.Offre)
                .Include(f => f.Abonnement).ThenInclude(a => a.Service)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FeedbackDto
                {
                    Id = f.Id,
                    ClientId = f.ClientId,
                    ClientUsername = f.Client.Username,
                    ClientEmail = f.Client.Email,
                    AbonnementId = f.AbonnementId,
                    OffreIntitule = f.Abonnement.Offre != null
                        ? f.Abonnement.Offre.IntituleOffre
                        : f.Abonnement.Service != null
                            ? f.Abonnement.Service.IntituleService
                            : "",
                    Note = f.Note,
                    CreatedAt = f.CreatedAt
                })
                .ToListAsync();
        }
        public async Task<int?> GetMyNoteAsync(Guid clientId, Guid abonnementId)
        {
            var feedback = await _db.Feedbacks
                .FirstOrDefaultAsync(f => f.ClientId == clientId && f.AbonnementId == abonnementId);
            return feedback?.Note;
        }
    }
}