namespace TimesheetAPI.Models
{
    public class TimesheetScreenConfig
    {
        public string ScreenTitle { get; set; } = "Submit Timesheet";
        public string ScreenInstructions { get; set; }
        public DateTime TimesheetDay { get; set; }
        public List<QuestionConfig> Questions { get; set; }
    }

    public class QuestionConfig
    {
        public int SequenceNo { get; set; }
        public string QuestionText { get; set; }
        public bool IsMandatory { get; set; }
        public List<string> Options { get; set; } // Drop-down options for specific questions
    }
}