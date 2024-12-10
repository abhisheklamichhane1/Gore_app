namespace TimesheetAPI.Models
{
    public class SubmitQuestions
    {
        public string SiteID { get; set; }
    
        public int SequenceNo { get; set; }
        public string QuestionText { get; set; }
        public string ResponseCSV { get; set; }
        public string DefaultValue { get; set; }
        public bool Mandatory { get; set; }
    }
}
