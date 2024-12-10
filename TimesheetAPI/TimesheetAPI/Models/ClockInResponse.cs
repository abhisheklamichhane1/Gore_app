namespace TimesheetAPI.Models
{
    public class ClockInResponse
    {
        public string Status { get; set; }
        public string TaskId { get; set; }
        public string StartTime { get; set; }
        public DateTime ForDate { get; set; }
        public List<TimeSheetTasks> TimesheetList { get; set; } // Include the list of timesheet tasks
    }
}
