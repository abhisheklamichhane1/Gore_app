namespace TimesheetAPI.Models
{
    public class SheetTime
    {
        public string SiteID { get; set; }
        public int UserID { get; set; }
        public DateTime ForDate { get; set; }
        public DateTime? SubmitTime { get; set; }
        public DateTime? UploadTime { get; set; }
        public string DayOffReason { get; set; }
        public string Comments { get; set; }
    }
}
