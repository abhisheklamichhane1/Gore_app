using Microsoft.EntityFrameworkCore;
using TimesheetAPI.Models;

public class TimeSheetService
{
    private readonly TimeSheetDbContext _context;

    public TimeSheetService(TimeSheetDbContext context)
    {
        _context = context;
    }

    public IEnumerable<TimeSheets> GetTimeSheets(int userID) =>
        _context.TimeSheets.Where(t => t.UserID == userID).ToList();

    public void AddTimeSheet(TimeSheets timesheet)
    {
        Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry<TimeSheets> entityEntry = _context.TimeSheets.Add(timesheet);
        _context.SaveChanges();
    }

    // Example method to clock in a user
    //public ClockInResponse ClockIn(ClockInRequest request)
    //{
    //    // Add your clock-in logic here, such as recording the clock-in time to the database.
    //    // This is a placeholder logic. Replace with actual database save logic.

    //    if (string.IsNullOrEmpty(request.UserId) || string.IsNullOrEmpty(request.SiteId))
    //    {
    //        throw new ArgumentException("UserId and SiteId are required for clock-in.");
    //    }

    //    return new ClockInResponse
    //    {
    //        Status = "success",
    //        Message = "Clock-in successful",
    //        ClockInTime = request.Timestamp
    //    };
    //}

    // Method to clock out a user
    public ClockOutResponse ClockOut(ClockOutRequest request)
    {
        // Add your clock-out logic here, e.g., updating the database with clock-out time
        if (string.IsNullOrEmpty(request.UserId) || string.IsNullOrEmpty(request.SiteId))
        {
            throw new ArgumentException("UserId and SiteId are required for clock-out.");
        }

        return new ClockOutResponse
        {
            Status = "success",
            Message = "Clock-out successful",
            ClockOutTime = request.Timestamp
        };
    }

    // Fetches a time entry by its ID
    //public TimeEntryResponse GetTimeEntry(int entryId)
    //{
    //    var entry = _context.TimeEntries.Find(entryId);
    //    if (entry == null) throw new ArgumentException("Entry not found");

    //    //entry.StartTime = entry.StartTime == default ? DateTime.Now : entry.StartTime;

    //    return new TimeEntryResponse
    //    {
    //        TimeFor = entry.TimeFor,
    //        StartTime = entry.StartTime,
    //        //FinishTime = entry.FinishTime,
    //        //TotalTime = (entry.FinishTime - entry.StartTime).TotalMinutes,
    //        JobNo = entry.JobNo,
    //        PlantNo = entry.PlantNo,
    //        SMHStart = entry.SMHStart,
    //        SMHFinish = entry.SMHFinish,
    //       // Details = entry.Details
    //    };
    //}

    // Updates an existing time entry
    //public void UpdateTimeEntry(TimeEntryUpdateRequest request)
    //{
    //    var entry = _context.TimeEntries.Find(request.EntryId);
    //    if (entry == null) throw new ArgumentException("Entry not found");

    //    entry.TimeFor = request.TimeFor;
    //    entry.StartTime = request.StartTime;
    //    entry.FinishTime = request.FinishTime;
    //    entry.JobNo = request.JobNo;
    //    entry.PlantNo = request.PlantNo;
    //    entry.SMHStart = request.SMHStart;
    //    entry.SMHFinish = request.SMHFinish;
    //    //entry.Details = request.Details;

    //    _context.SaveChanges();
    //}


}
