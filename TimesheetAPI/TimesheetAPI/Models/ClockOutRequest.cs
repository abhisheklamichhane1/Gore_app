namespace TimesheetAPI.Models
{
    public class ClockOutRequest
    {
        public string UserId { get; set; }          // The ID of the user clocking out
        public DateTime Timestamp { get; set; }     // The time of clock-out, typically UTC
        public string SiteId { get; set; }          // The ID of the site/location
    }
}
