namespace TimesheetAPI.Models
{
    public class ClockOutResponse
    {
        public string Status { get; set; }          // Status message, e.g., "success"
        public string Message { get; set; }         // Optional message, e.g., "Clock-out successful"
        public DateTime ClockOutTime { get; set; }  // The confirmed clock-out time
    }
}
