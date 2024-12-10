namespace TimesheetAPI.Models
{
    public class TimesheetSubmitQuestionDto
    {
        public Dictionary<string, string> Answers { get; set; }  // "answers" as dictionary
        public DateTime ForDate { get; set; }  // "forDate" as DateTime
        public string SiteID { get; set; }  // "siteID" as string
        public int userID { get; set; }  // "userID" as integer
    }
}
