using AxiaAbonnement.Models.DTOs.Payment;
using AxiaAbonnement.Models.DTOs.Pdf;

namespace AxiaAbonnement.Services.Interfaces
{
    public interface IPdfExportService
    {
        byte[] GenerateSignedPdf(PdfExportRequestDto dto, string adminName, string adminEmail);
        byte[] GeneratePaymentReceiptPdf(PaiementDto dto, string clientName, string clientEmail);
    }
}