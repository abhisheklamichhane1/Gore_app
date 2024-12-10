namespace TimesheetAPI.Models
{
    public class TimeEntryUpdateRequest
    {
        public int EntryId { get; set; }                 // Unique ID of the time entry to update
        public string TimeFor { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime FinishTime { get; set; }
        public string JobNo { get; set; }
        public string PlantNo { get; set; }
        public string SMHStart { get; set; }
        public string SMHFinish { get; set; }
        public string Details { get; set; }
    }
}
