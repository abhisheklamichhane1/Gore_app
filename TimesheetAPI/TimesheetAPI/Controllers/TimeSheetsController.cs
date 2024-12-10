using Microsoft.AspNetCore.Mvc;
using TimesheetAPI.Services; // Replace with the actual namespace of TimeSheetService
using TimesheetAPI.Models; // Replace with the actual namespace of TimeSheet model
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore; // For async EF calls

namespace TimesheetAPI.Controllers
{
    [Route("api/timesheets")]
    [ApiController]
    public class TimeSheetsController : ControllerBase
    {
        private readonly TimeSheetService _timeSheetService;
        private readonly TimeSheetDbContext _context;

        // Constructor injection of both the service and the DbContext
        public TimeSheetsController(TimeSheetService timeSheetService, TimeSheetDbContext context)
        {
            _timeSheetService = timeSheetService;
            _context = context;
        }

        //[HttpGet("{operatorId}")]
        //public IActionResult GetTimeSheets(int operatorId)
        //{
        //    var timeSheets = _timeSheetService.GetTimeSheets(operatorId);
        //    return Ok(timeSheets);
        //}

        //[HttpPost]
        //public IActionResult AddTimeSheet([FromBody] Timesheet timesheet)
        //{
        //    _timeSheetService.AddTimeSheet(timesheet);
        //    return Ok("Timesheet added successfully");
        //}

        [HttpPost("clock-in")]
        public async Task<IActionResult> ClockIn([FromBody] ClockInRequest request)
        {
            if (request == null)
            {
                return BadRequest("Task details are required.");
            }

            // Create a new time entry task with current time as StartTime
            var newTask = new TimeSheetTasks
            {
                JobNo = request.JobNo,
                SiteID = request.SiteID,
                UserID = request.UserID,
                ForDate = DateTime.UtcNow.Date, // Default to today's date for the task
                //StartTime = DateTime.UtcNow,  // Automatically set StartTime to current UTC time
                StartTime = request.StartTime,
                FinishTime = null,            // FinishTime is initially null
                TimeFor = request.TimeFor,
                ReferenceNo1 = request.ReferenceNo1,
                ReferenceNo2 = request.ReferenceNo2,
                ReferenceNo3 = request.ReferenceNo3,
                WorkDone = request.WorkDone
            };

            // Save the task to the database
            _context.TimeSheetTasks.Add(newTask);
            await _context.SaveChangesAsync();

            // Fetch only today's timesheet tasks for the user
            var today = DateTime.UtcNow.Date;
            var timesheetList = await _context.TimeSheetTasks
                                               .Where(t => t.UserID == request.UserID && t.ForDate == today)
                                               .OrderByDescending(t => t.StartTime)
                                               .ToListAsync();

            // Return the response with updated timesheet data
            var response = new ClockInResponse
            {
                Status = "Success",
                TaskId = newTask.JobNo,
                StartTime = newTask.StartTime, // The StartTime will now be the current time
                ForDate = newTask.ForDate,
                TimesheetList = timesheetList // Include the updated list of timesheet tasks
            };

            return Ok(response);
        }


        //[HttpPost("clockout")]
        //public IActionResult ClockOut([FromBody] ClockOutRequest request)
        //{
        //    try
        //    {
        //        var response = _timeSheetService.ClockOut(request);
        //        return Ok(response);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(ex.Message);
        //    }
        //}

        //// GET /api/timesheet/entry/{entryId}
        //[HttpGet("entry/{entryId}")]
        //public IActionResult GetTimeEntry(int entryId)
        //{
        //    try
        //    {
        //        var response = _timeSheetService.GetTimeEntry(entryId);
        //        return Ok(response);
        //    }
        //    catch (Exception ex)
        //    {
        //        return NotFound(ex.Message);
        //    }
        //}

        // POST /api/timesheet/entry/update
        //[HttpPost("entry/update")]
        //public IActionResult UpdateTimeEntry([FromBody] TimeEntryUpdateRequest request)
        //{
        //    try
        //    {
        //        _timeSheetService.UpdateTimeEntry(request);
        //        return Ok(new { Status = "success", Message = "Entry updated successfully" });
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(ex.Message);
        //    }
        //}



        // GET: /api/timesheets?siteid=1001&date=2024-11-20
        [HttpGet]
        public async Task<ActionResult> GetTimesheet(string siteid, string date)
        {
            // Validate parameters
            if (string.IsNullOrEmpty(siteid) || string.IsNullOrEmpty(date))
            {
                return BadRequest(new { error = "Missing required parameters: siteid and date." });
            }

            if (!DateTime.TryParse(date, out DateTime parsedDate))
            {
                return BadRequest(new { error = "Invalid date format. Use YYYY-MM-DD." });
            }

            try
            {
                // Query the database for timesheet entries for the specified siteid and date
                var allEntries = await _context.TimeSheetTasks
    .Where(t => t.SiteID == siteid)
    .ToListAsync();

                var timesheetEntries = allEntries
    .Where(t => t.ForDate.Date == parsedDate.Date) // Directly compare ForDate
    .OrderBy(t => t.StartTime) // Assuming StartTime is of type DateTime
    .ToList();

                if (timesheetEntries == null || !timesheetEntries.Any())
                {
                    return NotFound(new { error = "No timesheet entries found for the specified siteid and date." });
                }

                // Calculate the total time worked
                double totalTime = timesheetEntries.Sum(t => t.TotalTime);  // Removed `.Date`

                // Prepare the response
                var response = new
                {
                    SiteId = siteid,
                    Date = date,
                    Timesheet = timesheetEntries.Select(entry => new
                    {
                        entry.StartTime,
                        entry.FinishTime,
                        TotalTime = Math.Round(entry.TotalTime, 2), // rounded to 2 decimal places
                        entry.JobNo,
                        entry.ReferenceNo1,
                        entry.ReferenceNo2,
                        entry.ReferenceNo3
                    }),
                    TotalTime = Math.Round(totalTime, 2) // rounded to 2 decimal places
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
