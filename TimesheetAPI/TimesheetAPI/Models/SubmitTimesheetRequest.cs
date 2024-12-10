namespace TimesheetAPI.Models
{
    public class SubmitTimesheetRequest
    {
        public int UserId { get; set; }
        public DateTime ForDate { get; set; }
        public string StartTime { get; set; }
        public string FinishTime { get; set; }
        public string TotalTime { get; set; }
        public string Comments { get; set; }
        public List<TimesheetResponse> Responses { get; set; }
    }

    public class TimesheetResponse
    {
        public int SequenceNo { get; set; }
        public string ResponseText { get; set; }
    }
}
