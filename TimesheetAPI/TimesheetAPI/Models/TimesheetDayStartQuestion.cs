namespace TimesheetAPI.Models
{
    public class TimesheetDayStartQuestion
    {
        public string SiteID { get; set; }
        public int UserID { get; set; }
        public DateTime ForDate { get; set; }
        public int SequenceNo { get; set; }
        public string QuestionText { get; set; }
        public string ResponseText { get; set; }
    }
}
