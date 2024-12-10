namespace TimesheetAPI.Models
{
    public class DayStartQuestionDto
    {
        public int SequenceNo { get; set; }  // This should be an int, not string
        public string QuestionText { get; set; }
        public List<string> DropdownValues { get; set; }
        public string DefaultValue { get; set; }
        public bool Mandatory { get; set; }
    }
}
