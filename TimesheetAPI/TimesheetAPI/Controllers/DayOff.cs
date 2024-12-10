using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TimesheetAPI.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Data.SqlTypes;
namespace TimesheetAPI.Controllers
{

    [ApiController]
    [Route("api/dayoff")]
    public class DayOffController : ControllerBase
    {
        private readonly TimeSheetDbContext _context;
        private readonly ILogger<DayOffController> _logger;

        public DayOffController(TimeSheetDbContext context, ILogger<DayOffController> logger)
        {
            _context = context;
            _logger = logger;
        }


        [HttpPost("submit")]
        public async Task<IActionResult> SubmitDayOff([FromBody] TimeSheets timesheet)
        {
            if (timesheet == null)
            {
                _logger.LogWarning("SubmitDayOff: No data received.");
                return BadRequest("Day Off data is required.");
            }

            // Validate the ForDate field
            if (timesheet.ForDate == DateTime.MinValue)
            {
                _logger.LogWarning("SubmitDayOff: Invalid ForDate.");
                return BadRequest("Invalid ForDate.");
            }

            try
            {
                // Check if a DayOff submission for the same date, site, and user already exists
                var existingDayOff = await _context.TimeSheets
                    .FirstOrDefaultAsync(t =>
                        t.SiteID == timesheet.SiteID &&
                        t.UserID == timesheet.UserID &&
                        t.ForDate.Date == timesheet.ForDate.Date); // Comparing only the date part of ForDate

                if (existingDayOff != null)
                {
                    // If a record already exists for the same date, return a message that submission is already completed
                    _logger.LogInformation($"Submission already exists for UserID {timesheet.UserID} on {timesheet.ForDate.ToShortDateString()}.");
                    return BadRequest("Today Day Submission is already completed, try tomorrow.");
                }

                // If no existing record, process the new submission
                var newDayOff = new TimeSheets
                {
                    SiteID = timesheet.SiteID,
                    UserID = timesheet.UserID,
                    ForDate = timesheet.ForDate,
                    SubmitTime = timesheet.SubmitTime ?? DateTime.UtcNow, // If SubmitTime is null, use UTC Now
                    UploadTime = timesheet.UploadTime ?? DateTime.UtcNow, // If UploadTime is null, use UTC Now
                    DayOffReason = timesheet.DayOffReason, // Optional, can be null
                    Comments = timesheet.Comments
                };

                _context.TimeSheets.Add(newDayOff);
                _logger.LogInformation($"Inserted new DayOff record for UserID {timesheet.UserID} on {timesheet.ForDate.ToShortDateString()}.");

                await _context.SaveChangesAsync();

                // Return a different success message based on whether DayOffReason is provided
                if (!string.IsNullOrEmpty(timesheet.DayOffReason))
                {
                    return Ok("Day Off submitted successfully.");
                }
                else
                {
                    return Ok("TimeSheet submitted successfully.");
                }
            }
            catch (SqlNullValueException ex)
            {
                // Log the exception and return a custom error message
                _logger.LogError($"SqlNullValueException: {ex.Message}");
                return BadRequest("Today Day Submission is already completed, try tomorrow.");
            }
            catch (Exception ex)
            {
                // Log any other exceptions and return a general error message
                _logger.LogError($"Exception: {ex.Message}");
                return StatusCode(500, "An unexpected error occurred. Please try again later.");
            }
        }



        [HttpGet("pastdates/{siteId}/{userId}")]
        public async Task<IActionResult> GetPastDatesWithoutDayOffReason(string siteId, int userId)
        {
            try
            {
                DateTime today = DateTime.Now.Date;

                // Fetch all past ForDate values where DayOffReason is null or empty
                var pastDatesWithoutDayOffReason = await _context.TimeSheets
                    .Where(ts =>
                        ts.SiteID == siteId &&
                        ts.UserID == userId &&
                        ts.ForDate < today && // Only past dates
                        string.IsNullOrEmpty(ts.DayOffReason)) // Filter for missing DayOffReason
                    .Select(ts => ts.ForDate) // Select only the ForDate field
                    .Distinct()
                    .OrderBy(date => date) // Sort by date
                    .ToListAsync();

                // Log the fetched past dates for debugging purposes
                _logger.LogInformation("Fetched past dates without DayOffReason: " +
                    string.Join(", ", pastDatesWithoutDayOffReason));

                if (!pastDatesWithoutDayOffReason.Any())
                {
                    return NotFound(new { message = "No past dates found without a DayOffReason." });
                }

                return Ok(pastDatesWithoutDayOffReason); // Return as an array
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching past dates without DayOffReason: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while fetching the data.", details = ex.Message });
            }
        }




        [HttpGet]
        public async Task<IActionResult> GetDayOff([FromQuery] string siteID, [FromQuery] int userID, [FromQuery] DateTime forDate)
        {
            var dayOff = await _context.TimeSheets
                .FirstOrDefaultAsync(t =>
                    t.SiteID == siteID &&
                    t.UserID == userID &&
                    t.ForDate.Date == forDate.Date);

            if (dayOff == null)
            {
                _logger.LogWarning($"No Day Off found for UserID {userID} on {forDate.ToShortDateString()}.");
                return NotFound("No Day Off record found for the specified details.");
            }

            return Ok(dayOff);
        }
    }
}
