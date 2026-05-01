using AxiaAbonnement.Models.Email;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;

namespace AxiaAbonnement.Services.Implementations
{
    public class EmailSender : IEmailSender
    {
        private readonly EmailConfiguration _config;
        private readonly ILogger<EmailSender> _logger;

        public EmailSender(EmailConfiguration config, ILogger<EmailSender> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            using var client = new SmtpClient(_config.SmtpServer, _config.Port)
            {
                Credentials = new NetworkCredential(_config.Username, _config.Password),
                EnableSsl = true,
                Timeout = 10000
            };

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(_config.From),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            try
            {
                await client.SendMailAsync(mailMessage);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Échec envoi email à {Email}", toEmail);
            }
        }
    }
}