using AxiaAbonnement.Models.DTOs.Signature;

namespace AxiaAbonnement.Services.Interfaces
{
    public interface ISignatureService
    {
        SignResponseDto Sign(string hash, string documentTitle,
            string adminId, string adminName, string adminEmail);

        bool Verify(string hash, string signature, string adminId,
            string timestamp, string documentTitle);

        string GetPublicKeyPem();
    }
}
