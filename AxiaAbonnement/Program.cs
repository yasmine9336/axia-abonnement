using AxiaAbonnement.Data;
using AxiaAbonnement.Hubs;
using AxiaAbonnement.Middleware;
using AxiaAbonnement.Models.Email;
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

// 1. Contrôleurs API (JSON uniquement)
builder.Services.AddControllers();

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
var allowedOrigins = builder.Configuration
    .GetSection("AllowedOrigins").Get<string[]>()!;
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials();
    });
});

// 4. Base de données EF Core 10
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

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


var emailConfig = builder.Configuration
    .GetSection("EmailConfiguration")
    .Get<EmailConfiguration>();
builder.Services.AddSingleton(emailConfig!);

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
                Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:Token"]!))
        };

        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var dbContext = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();

                var userId = context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (userId != null)
                {
                    var user = await dbContext.Users.FindAsync(Guid.Parse(userId));

                    if (user == null || !user.IsActive)
                    {
                        context.Fail("Compte désactivé");
                    }
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
        Console.WriteLine($"ERREUR SEED: {ex.Message}");
        Console.WriteLine(ex.StackTrace);
        Console.ReadLine();
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
