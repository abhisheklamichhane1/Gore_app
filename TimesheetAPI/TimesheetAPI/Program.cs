using Microsoft.EntityFrameworkCore;
using TimesheetAPI.Models;
using TimesheetAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure CORS policy (ensure you are allowing the correct origins)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowMobileApp", policyBuilder =>
    {
        // Replace this with your frontend URL
        policyBuilder
            .AllowAnyOrigin() // Allow all origins
            .AllowAnyMethod()
            .AllowAnyHeader();  // Allow credentials for sending cookies and authentication headers
    });
});

// Register DbContext with dependency injection
builder.Services.AddDbContext<TimeSheetDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")  // Ensure your connection string is correct
    ));

// Register services
builder.Services.AddScoped<TimeSheetService>();
builder.Services.AddScoped<SettingsService>();
builder.Services.AddScoped<AuthenticationService>();

// Add controllers and Swagger services for easy testing
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Enable Swagger middleware for development (useful for debugging)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// *Important*: Apply CORS middleware before routing and authorization middleware
app.UseCors("AllowMobileApp");

// Handle OPTIONS preflight requests
app.Use(async (context, next) =>
{
    if (context.Request.Method == HttpMethods.Options)
    {
        context.Response.StatusCode = StatusCodes.Status204NoContent; // No Content for OPTIONS request
        return; // Stop further processing for OPTIONS requests
    }
    await next(); // Continue processing other requests
});


app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "API V1");
    options.RoutePrefix = String.Empty;

});



// Authorization middleware for handling authentication and authorization
app.UseAuthorization();

// Map controllers (this makes sure your API endpoints are available)
app.MapControllers();

// Run the application
app.Run();