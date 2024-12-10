using Microsoft.AspNetCore.Mvc;
using TimesheetAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class TestConnectionController : ControllerBase
{
    private readonly TimeSheetDbContext _context;

    public TestConnectionController(TimeSheetDbContext context)
    {
        _context = context;
    }

    [HttpGet("test-connection")]
    public IActionResult TestConnection()
    {
        try
        {
            // Run a simple query to test the connection
            var operatorCount = _context.Operators.Count();
            return Ok($"Database connected successfully. Operators count: {operatorCount}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Database connection failed: {ex.Message}");
        }
    }
}
