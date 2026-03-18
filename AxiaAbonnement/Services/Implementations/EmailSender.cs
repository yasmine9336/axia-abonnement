using System.Net;
using System.Net.Mail;
using AxiaAbonnement.Models.Email;
using AxiaAbonnement.Services.Interfaces;

namespace AxiaAbonnement.Services.Implementations
{
    public class EmailSender : IEmailSender
    {
        private readonly EmailConfiguration _config;

        public EmailSender(EmailConfiguration config) 
        {
            _config = config;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body) 
        {
            var client = new SmtpClient(_config.SmtpServer, _config.Port)
            {
                Credentials = new NetworkCredential(_config.Username, _config.Password), EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_config.From),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            await client.SendMailAsync(mailMessage);

        }
    }
}
