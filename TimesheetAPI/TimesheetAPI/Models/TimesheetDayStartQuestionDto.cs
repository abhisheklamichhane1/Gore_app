namespace TimesheetAPI.Models
{
    public class TimesheetDayStartQuestionDto
    {
        public Dictionary<string, string> answers { get; set; } // key is SequenceNo, value is the answer
        public string siteID { get; set; }
        public int userID { get; set; }
    }
}
