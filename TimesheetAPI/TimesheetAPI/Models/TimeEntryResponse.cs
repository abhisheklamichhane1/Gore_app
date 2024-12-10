namespace TimesheetAPI.Models
{
    public class TimeEntryResponse
    {
        public string TimeFor { get; set; }              // e.g., Job, Smoko, Lunch, Travel
        public DateTime StartTime { get; set; }          // Start time of the entry
        public DateTime FinishTime { get; set; }         // Finish time of the entry
        public double TotalTime { get; set; }            // Total time in hours or minutes
        public string JobNo { get; set; }                // Reference number for the job
        public string PlantNo { get; set; }              // Reference number for the plant
        public string SMHStart { get; set; }             // Clock card start
        public string SMHFinish { get; set; }            // Clock card finish
        public string Details { get; set; }              // Description of work performed
    }
}
