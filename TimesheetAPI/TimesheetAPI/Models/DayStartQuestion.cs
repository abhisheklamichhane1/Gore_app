namespace TimesheetAPI.Models
{
    public class DayStartQuestion
    {
        public int? SequenceNo { get; set; }  // Make it nullable
        public string QuestionText { get; set; }
        public string ResponseCSV { get; set; }
        public string DefaultValue { get; set; }
        public bool Mandatory { get; set; }
    }
}
