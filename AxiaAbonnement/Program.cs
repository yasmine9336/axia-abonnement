using AxiaAbonnement.Data;
using AxiaAbonnement.Hubs;
using AxiaAbonnement.Middleware;
using AxiaAbonnement.Models.Email;
using AxiaAbonnement.Services.BackgroundServices;
using AxiaAbonnement.Services.Implementations;
using AxiaAbonnement.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;             // ← UI de test
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var jwtToken = builder.Configuration["AppSettings:Token"];
var defaultConnection = builder.Configuration.GetConnectionString("DefaultConnection");
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();
var emailConfig = builder.Configuration
    .GetSection("EmailConfiguration")
    .Get<EmailConfiguration>();

if (string.IsNullOrWhiteSpace(jwtToken))
    throw new InvalidOperationException("Configuration manquante: AppSettings:Token.");

if (string.IsNullOrWhiteSpace(defaultConnection))
    throw new InvalidOperationException("Configuration manquante: ConnectionStrings:DefaultConnection.");

if (allowedOrigins is null || allowedOrigins.Length == 0)
    throw new InvalidOperationException("Configuration manquante: AllowedOrigins.");

if (emailConfig is null ||
    string.IsNullOrWhiteSpace(emailConfig.From) ||
    string.IsNullOrWhiteSpace(emailConfig.SmtpServer) ||
    emailConfig.Port <= 0 ||
    string.IsNullOrWhiteSpace(emailConfig.Username) ||
    string.IsNullOrWhiteSpace(emailConfig.Password))
{
    throw new InvalidOperationException("Configuration EmailConfiguration invalide ou incomplète.");
}

// 1. Contrôleurs API 
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("AuthPolicy", o =>
    {
        o.Window = TimeSpan.FromMinutes(1);
        o.PermitLimit = 10;
        o.QueueLimit = 0;
    });
    options.RejectionStatusCode = 429;
});

builder.Services.AddSignalR();

// 2. OpenAPI + Scalar (remplace Swashbuckle/Swagger sous .NET 10)
builder.Services.AddOpenApi();

// 3. CORS — autoriser React
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
    });
});

// 4. Base de données EF Core 10
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(defaultConnection));

// 5. Injection de dépendance
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDemandeResponsableService, DemandeResponsableService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IServiceManager, ServiceManager>();
builder.Services.AddScoped<IEmailSender, EmailSender>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IOffreService, OffreService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IAbonnementService, AbonnementService>();
builder.Services.AddScoped<IDemandeService, DemandeService>();
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddSingleton<IPdfExportService, PdfExportService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddHostedService<RenewalPaymentExpiryService>();

builder.Services.AddSingleton(emailConfig);

// 6. Authentification JWT Bearer
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidIssuer = builder.Configuration["AppSettings:Issuer"],
            ValidAudience = builder.Configuration["AppSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtToken))
        };

        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var dbContext = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();

                var userId = context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (Guid.TryParse(userId, out var parsedUserId))
                {
                    var user = await dbContext.Users.FindAsync(parsedUserId);

                    if (user == null || !user.IsActive)
                    {
                        context.Fail("Compte désactivé");
                    }
                }
                else
                {
                    context.Fail("Token invalide: NameIdentifier manquant ou invalide.");
                }
            },

            OnMessageReceived = context =>
            {
                // SignalR envoie le token via la query string
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// 7. Politiques d'autorisation par rôle
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ClientOnly", p => p.RequireRole("Client"));
    options.AddPolicy("ResponsableOnly", p => p.RequireRole("Responsable"));
    options.AddPolicy("AdminOnly", p => p.RequireRole("Admin"));
    options.AddPolicy("StaffOnly", p => p.RequireRole("Responsable", "Admin"));
});

var app = builder.Build();

// 8. Seed BDD au démarrage
using (var scope = app.Services.CreateScope())
{
    try
    {
        await DbInitializer.SeedAsync(scope.ServiceProvider);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Erreur lors du seed initial de la base.");
    }
}

// 9. Pipeline HTTP (ordre obligatoire)
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();             // ← expose /openapi/v1.json
    app.MapScalarApiReference();  // ← UI de test sur /scalar/v1
}

app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseHttpsRedirection();
app.UseCors("ReactPolicy");   // ← AVANT Authentication
app.UseRateLimiter();
app.UseAuthentication();       // ← Lire et valider le JWT
app.UseAuthorization();        // ← Appliquer les [Authorize]
app.UseStaticFiles();
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");
app.Run();