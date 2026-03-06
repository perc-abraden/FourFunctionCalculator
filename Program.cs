var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularDevClient", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("AngularDevClient");
app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/", () => Results.Ok(new
{
    message = "Welcome to my super awesome calculator app!",
    endpoints = new[]
    {
        "/health",
        "/api/calculator/add?a=10&b=5",
        "/api/calculator/subtract?a=10&b=5",
        "/api/calculator/multiply?a=10&b=5",
        "/api/calculator/divide?a=10&b=5"
    }
}));

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapGet("/api/calculator/add", (double a, double b) =>
    Results.Ok(new { operation = "add", a, b, result = a + b }));

app.MapGet("/api/calculator/subtract", (double a, double b) =>
    Results.Ok(new { operation = "subtract", a, b, result = a - b }));

app.MapGet("/api/calculator/multiply", (double a, double b) =>
    Results.Ok(new { operation = "multiply", a, b, result = a * b }));

app.MapGet("/api/calculator/divide", (double a, double b) =>
{
    if (b == 0)
    {
        return Results.BadRequest(new { error = "Division by zero is not allowed." });
    }

    return Results.Ok(new { operation = "divide", a, b, result = a / b });
});

app.Run();
