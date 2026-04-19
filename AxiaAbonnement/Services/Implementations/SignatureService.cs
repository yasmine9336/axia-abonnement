using System.Security.Cryptography;
using System.Text;
using AxiaAbonnement.Models.DTOs.Signature;
using AxiaAbonnement.Services.Interfaces;

namespace AxiaAbonnement.Services.Implementations
{
    public class SignatureService : ISignatureService, IDisposable
    {
        private readonly RSA _rsa;
        private const string KeyFileName = "signature_keys.pem";

        public SignatureService(IWebHostEnvironment env)
        {
            _rsa = RSA.Create(2048);
            var keyPath = Path.Combine(env.ContentRootPath, KeyFileName);

            if (File.Exists(keyPath))
            {
                _rsa.ImportFromPem(File.ReadAllText(keyPath));
            }
            else
            {
                File.WriteAllText(keyPath, _rsa.ExportRSAPrivateKeyPem());
            }
        }

        private static string BuildPayload(string hash, string adminId,
            string timestamp, string documentTitle)
            => $"{hash}|{adminId}|{timestamp}|{documentTitle}";

        public SignResponseDto Sign(string hash, string documentTitle,
            string adminId, string adminName, string adminEmail)
        {
            var timestamp = DateTime.UtcNow.ToString("o");
            var payload = BuildPayload(hash, adminId, timestamp, documentTitle);
            var sigBytes = _rsa.SignData(
                Encoding.UTF8.GetBytes(payload),
                HashAlgorithmName.SHA256,
                RSASignaturePadding.Pkcs1);

            return new SignResponseDto
            {
                Hash = hash,
                Signature = Convert.ToBase64String(sigBytes),
                Algorithm = "RSA-SHA256",
                Timestamp = timestamp,
                AdminId = adminId,
                AdminName = adminName,
                AdminEmail = adminEmail,
                DocumentTitle = documentTitle,
            };
        }

        public bool Verify(string hash, string signature, string adminId,
            string timestamp, string documentTitle)
        {
            try
            {
                var payload = BuildPayload(hash, adminId, timestamp, documentTitle);
                return _rsa.VerifyData(
                    Encoding.UTF8.GetBytes(payload),
                    Convert.FromBase64String(signature),
                    HashAlgorithmName.SHA256,
                    RSASignaturePadding.Pkcs1);
            }
            catch
            {
                return false;
            }
        }

        public string GetPublicKeyPem() => _rsa.ExportSubjectPublicKeyInfoPem();

        public void Dispose() => _rsa.Dispose();
    }
}