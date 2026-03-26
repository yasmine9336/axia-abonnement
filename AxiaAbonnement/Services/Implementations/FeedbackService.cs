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

        public FeedbackService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<(bool Ok, string? Error)> AddFeedbackAsync(Guid clientId, CreateFeedbackDto dto)
        {
            if (dto.AbonnementId == Guid.Empty)
                return (false, "Abonnement invalide.");

            var abonnement = await _db.Abonnements
                .Include(a => a.Offre)
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
                Message = dto.Message.Trim(),
                Note = dto.Note,
                CreatedAt = DateTime.UtcNow
            };

            _db.Feedbacks.Add(feedback);
            await _db.SaveChangesAsync();

            return (true, null);
        }

        public async Task<List<FeedbackDto>> GetAllFeedbacksAsync()
        {
            return await _db.Feedbacks
                .Include(f => f.Client)
                .Include(f => f.Abonnement)
                .ThenInclude(a => a.Offre)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => new FeedbackDto
                {
                    Id = f.Id,
                    ClientId = f.ClientId,
                    ClientUsername = f.Client.Username,
                    ClientEmail = f.Client.Email,
                    AbonnementId = f.AbonnementId,
                    OffreIntitule = f.Abonnement.Offre.IntituleOffre,
                    Message = f.Message,
                    Note = f.Note,
                    CreatedAt = f.CreatedAt
                })
                .ToListAsync();
        }
    }
}