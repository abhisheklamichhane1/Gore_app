using Microsoft.AspNetCore.Mvc;
using TimesheetAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Globalization;
using System.Linq;

namespace TimesheetAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TimeEntryController : ControllerBase
    {
        private readonly TimeSheetDbContext _dbContext;
        //private readonly ILogger<TimeEntryController> _logger;

        public TimeEntryController(TimeSheetDbContext dbContext)
        {
            _dbContext = dbContext;

        }
        // GET: api/TimeEntry/timeSheetTasksID
        [HttpGet("{timeSheetTasksID}")]
        public async Task<IActionResult> GetSpecificData(int timeSheetTasksID)
        {
            try
            {
                // Query the database for the record with the provided TimeSheetTasksID
                var task = await _dbContext.TimeSheetTasks
                    .Where(task => task.TimeSheetTasksID == timeSheetTasksID)
                    .Select(task => new
                    {
                        task.TimeSheetTasksID,
                        task.StartTime,
                        task.FinishTime,
                        task.TimeFor,
                        task.JobNo,
                        Plant = task.ReferenceNo1,
                        SMHStart = task.ReferenceNo2,
                        SMHFinish = task.ReferenceNo3,
                        task.WorkDone
                    })
                    .FirstOrDefaultAsync();

                // Check if the data exists
                if (task == null)
                {
                    return NotFound(new { message = "No matching data found for the provided TimeSheetTasksID." });
                }

                return Ok(task);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving data.", details = ex.Message });
            }
        }

        // GET: api/TimeEntry/Today
        [HttpGet("Today/{userId}/{siteId}")]
        public async Task<IActionResult> GetTodayEntries(int userId, string siteId)
        {
            try
            {
                // Fetch Brisbane timezone information
                var brisbaneTimeZone = TimeZoneInfo.FindSystemTimeZoneById("E. Australia Standard Time");

                // Get the current UTC time
                DateTime utcNow = DateTime.UtcNow;

                // Convert UTC to Brisbane time
                DateTime todayInBrisbane = TimeZoneInfo.ConvertTimeFromUtc(utcNow, brisbaneTimeZone);

                // Start of the day in Brisbane time (00:00:00)
                DateTime startOfDay = todayInBrisbane.Date;

                // End of the day in Brisbane time (23:59:59)
                DateTime endOfDay = todayInBrisbane.Date.AddDays(1).AddTicks(-1);

                // Retrieve and project the required fields
                var todayEntries = await _dbContext.TimeSheetTasks
                    .Where(task => task.ForDate >= startOfDay && task.ForDate <= endOfDay && task.UserID == userId && task.SiteID == siteId)
                    .OrderBy(task => task.TimeSheetTasksID) // Corrected to OrderBy and fixed property name
                    .Select(task => new
                    {
                        task.TimeSheetTasksID,
                        task.StartTime,
                        task.FinishTime,
                        task.TimeFor,
                        task.JobNo,
                        Plant = task.ReferenceNo1, // Mapping ReferenceNo1 as Plant
                        task.TotalTime
                    })
                    .ToListAsync();


                if (!todayEntries.Any())
                {
                    return NotFound(new { message = $"No entries found for user ID {userId} at site ID {siteId} for today." });
                }

                return Ok(todayEntries);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving today's entries.", details = ex.Message });
            }
        }



        [HttpPut("UpdateSpecificData")]
        public async Task<IActionResult> UpdateSpecificData(int TimeSheetTasksId, [FromBody] TimeEntry updatedEntry)
        {
            try
            {
                // Validate updatedEntry object
                if (updatedEntry == null)
                {
                    return BadRequest(new { message = "Invalid request data. The request body cannot be null." });
                }

                // Find the task to update by TimeSheetTasksID
                var existingTask = await _dbContext.TimeSheetTasks
                    .FirstOrDefaultAsync(task => task.TimeSheetTasksID == TimeSheetTasksId);

                // Check if the task exists
                if (existingTask == null)
                {
                    return NotFound(new { message = $"No matching task found for TimeSheetTasksID={TimeSheetTasksId}." });
                }

                // Update fields from updatedEntry
                existingTask.StartTime = updatedEntry.StartTime ?? existingTask.StartTime;
                existingTask.FinishTime = updatedEntry.FinishTime ?? existingTask.FinishTime;
                existingTask.TimeFor = updatedEntry.TimeFor ?? existingTask.TimeFor;
                existingTask.JobNo = updatedEntry.JobNo ?? existingTask.JobNo;
                existingTask.ReferenceNo1 = updatedEntry.PlantNo ?? existingTask.ReferenceNo1;
                existingTask.ReferenceNo2 = updatedEntry.SMHStart ?? existingTask.ReferenceNo2;
                existingTask.ReferenceNo3 = updatedEntry.SMHFinish ?? existingTask.ReferenceNo3;
                existingTask.WorkDone = updatedEntry.WorkDone ?? existingTask.WorkDone;

                // Save changes to the database
                _dbContext.TimeSheetTasks.Update(existingTask);
                await _dbContext.SaveChangesAsync();

                return Ok(new { message = "Time entry updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating data.", details = ex.Message });
            }
        }

        [HttpGet("History/{userId}/{siteId}/{forDate}")]
        public async Task<IActionResult> GetAllTimeEntries(int userId, string siteId, string forDate)
        {
            try
            {
                // Parse ForDate from the request and validate the format
                if (!DateTime.TryParse(forDate, out DateTime parsedForDate))
                {
                    return BadRequest(new { message = "Invalid ForDate format. Please use 'yyyy-MM-dd' format." });
                }

                // Retrieve all time entries for the given UserID, SiteID, and ForDate
                var timeEntries = await _dbContext.TimeSheetTasks
                    .Where(task =>
                        task.UserID == userId &&
                        task.SiteID == siteId &&
                        task.ForDate == parsedForDate) // Filter by ForDate
                    .ToListAsync();

                // Filter out entries from today's StartTime
                var filteredEntries = timeEntries
                    .Where(task =>
                        !string.IsNullOrEmpty(task.StartTime) &&
                        task.StartTime != parsedForDate.ToString("yyyy-MM-dd")) // Exclude today's entries
                    .Select(task => new
                    {
                        task.TimeSheetTasksID,
                        task.StartTime,
                        task.FinishTime,
                        task.TimeFor,
                        task.JobNo,
                        Plant = task.ReferenceNo1, // Mapping ReferenceNo1 as Plant
                        task.TotalTime,
                        task.WorkDone
                    })
                    .ToList();

                // If no entries are found, return a Not Found response
                if (!filteredEntries.Any())
                {
                    return NotFound(new { message = $"No timesheet entries found for user ID {userId} at site {siteId} on {forDate}." });
                }

                // Return the filtered list of time entries
                return Ok(filteredEntries);
            }
            catch (Exception ex)
            {
                // Enhanced error logging
                var errorDetails = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, new
                {
                    message = "An error occurred while retrieving timesheet history.",
                    details = errorDetails
                });
            }
        }


        // DELETE: api/TimeEntry/Discard
        [HttpDelete("Discard")]
        public async Task<IActionResult> DeleteAllTodayEntries([FromBody] LoginRequest request)
        {
            try
            {             
                    // Validate the request and PIN
                    if (request == null || string.IsNullOrWhiteSpace(request.PIN) || string.IsNullOrWhiteSpace(request.UserName))
                {
                    return BadRequest(new { message = "Invalid request. UserName and PIN cannot be null or empty." });
                }

                // Retrieve user from the database by UserName
                var user = await _dbContext.Operators
                                           .FirstOrDefaultAsync(u => u.UserName == request.UserName);

                if (user == null)
                {
                    return Unauthorized(new { message = "User not found." });
                }

                // Direct PIN comparison (assuming PIN is stored as plain text in the database)
                if (request.PIN != user.PIN)
                {
                    return Unauthorized(new { message = "Invalid PIN. Access denied." });
                }

                // Fetch Brisbane timezone information
                var brisbaneTimeZone = TimeZoneInfo.FindSystemTimeZoneById("E. Australia Standard Time");

                // Get the current UTC time
                DateTime utcNow = DateTime.UtcNow;

                // Convert UTC to Brisbane time
                DateTime todayInBrisbane = TimeZoneInfo.ConvertTimeFromUtc(utcNow, brisbaneTimeZone);

                // Start of the day in Brisbane time (00:00:00)
                DateTime startOfDay = todayInBrisbane.Date;

                // End of the day in Brisbane time (23:59:59)
                DateTime endOfDay = todayInBrisbane.Date.AddDays(1).AddTicks(-1);

                // Fetch all tasks created today
                var tasksToDelete = await _dbContext.TimeSheetTasks
                    .Where(task => task.ForDate >= startOfDay && task.ForDate <= endOfDay)
                    .ToListAsync();

                if (!tasksToDelete.Any())
                {
                    return NotFound(new { message = "No tasks found for today." });
                }

                // Delete all tasks created today
                _dbContext.TimeSheetTasks.RemoveRange(tasksToDelete);
                await _dbContext.SaveChangesAsync();

                return Ok(new { message = $"{tasksToDelete.Count} tasks deleted successfully for today." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting today's tasks.", details = ex.Message });
            }
        }


        // POST: api/TimeEntry
        [HttpPost]
        public async Task<IActionResult> UpdateOrCreateTimeEntry([FromBody] TimeEntry timeEntry)
        {
            if (timeEntry == null)
                return BadRequest(new { message = "Invalid time entry data." });

            try
            {
                TimeSheetTasks? existingTask = null;

                // Check if TimeSheetTasksID is provided
                if (timeEntry.TimeSheetTasksID != null)
                {
                    // Try to find an existing task by TimeSheetTasksID
                    existingTask = await _dbContext.TimeSheetTasks
                        .FirstOrDefaultAsync(t => t.TimeSheetTasksID == timeEntry.TimeSheetTasksID);
                }

                // If no TimeSheetTasksID is provided or no existing task found, we create a new task
                if (existingTask != null)
                {
                    // Check if the previous task has no FinishTime (clocked off)
                    if (existingTask.FinishTime == null)
                    {
                        // If StartTime is not null or empty, try to parse it to DateTime
                        if (!string.IsNullOrWhiteSpace(existingTask.StartTime))
                        {
                            DateTime startDateTime;

                            // Try to parse StartTime string to DateTime
                            if (DateTime.TryParse(existingTask.StartTime, out startDateTime))
                            {
                                DateTime endOfDay = startDateTime.Date.AddHours(23).AddMinutes(59).AddSeconds(59);

                                // If the current time is after 11:59 PM, set FinishTime to end of the day
                                if (DateTime.Now.Date == startDateTime.Date && DateTime.Now > endOfDay)
                                {
                                    existingTask.FinishTime = endOfDay.ToString("yyyy-MM-dd HH:mm:ss"); // Convert DateTime to string
                                }
                            }
                            else
                            {
                                // Handle invalid StartTime format
                                return BadRequest(new { message = "Invalid StartTime format." });
                            }
                        }

                        _dbContext.TimeSheetTasks.Update(existingTask);  // Update the previous task
                        await _dbContext.SaveChangesAsync();  // Save changes to the database
                    }

                    // Update the existing task with new details
                    existingTask.StartTime = timeEntry.StartTime ?? existingTask.StartTime;
                    existingTask.FinishTime = timeEntry.FinishTime ?? existingTask.FinishTime;
                    existingTask.TimeFor = timeEntry.TimeFor ?? existingTask.TimeFor;
                    existingTask.JobNo = timeEntry.JobNo ?? existingTask.JobNo;
                    existingTask.ReferenceNo1 = timeEntry.PlantNo ?? existingTask.ReferenceNo1;
                    existingTask.ReferenceNo2 = timeEntry.SMHStart ?? existingTask.ReferenceNo2;
                    existingTask.ReferenceNo3 = timeEntry.SMHFinish ?? existingTask.ReferenceNo3;
                    existingTask.WorkDone = timeEntry.WorkDone ?? existingTask.WorkDone;

                    _dbContext.TimeSheetTasks.Update(existingTask);
                    await _dbContext.SaveChangesAsync();

                    return Ok(new
                    {
                        message = "Time entry updated successfully.",
                        id = existingTask.TimeSheetTasksID,
                        isNew = false
                    });
                }
                else
                {
                    // Create new task if no matching task is found by TimeSheetTasksID
                    var newTimeSheetTask = new TimeSheetTasks
                    {
                        SiteID = timeEntry.SiteID,
                        UserID = timeEntry.UserID,
                        ForDate = timeEntry.ForDate,
                        StartTime = timeEntry.StartTime,
                        FinishTime = string.IsNullOrWhiteSpace(timeEntry.FinishTime) ? null : timeEntry.FinishTime,
                        TimeFor = timeEntry.TimeFor,
                        JobNo = timeEntry.JobNo,
                        ReferenceNo1 = timeEntry.PlantNo,
                        ReferenceNo2 = timeEntry.SMHStart,
                        ReferenceNo3 = timeEntry.SMHFinish,
                        WorkDone = timeEntry.WorkDone
                    };

                    // Fetch the last task for the given SiteID and UserID (excluding current task)
                    var lastTask = await _dbContext.TimeSheetTasks
                        .Where(t => t.SiteID == timeEntry.SiteID && t.UserID == timeEntry.UserID && t.FinishTime == null)
                        .OrderByDescending(t => t.StartTime)  // Get the last task that was not finished
                        .FirstOrDefaultAsync();

                    // If there is a previous task with no Finish Time, update it
                    if (lastTask != null)
                    {
                        lastTask.FinishTime = timeEntry.StartTime;  // Set Finish Time to the new task's Start Time
                        _dbContext.TimeSheetTasks.Update(lastTask); // Update the previous task
                        await _dbContext.SaveChangesAsync(); // Save changes to the database
                    }

                    // Add the new task to the database
                    await _dbContext.TimeSheetTasks.AddAsync(newTimeSheetTask);
                    await _dbContext.SaveChangesAsync();

                    return CreatedAtAction(nameof(GetSpecificData),
                        new { timeSheetTasksID = newTimeSheetTask.TimeSheetTasksID },
                        new
                        {
                            message = "Time entry created successfully.",
                            id = newTimeSheetTask.TimeSheetTasksID,
                            isNew = true
                        });
                }
            }
            catch (Exception ex)
            {
                // Enhanced error logging
                var errorDetails = ex.InnerException?.Message ?? ex.Message;
                return StatusCode(500, new
                {
                    message = "An error occurred while processing the time entry.",
                    details = errorDetails
                });
            }
        }


    }
}
