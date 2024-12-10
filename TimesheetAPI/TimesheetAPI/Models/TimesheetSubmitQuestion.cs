namespace TimesheetAPI.Models
{
    public class TimesheetSubmitQuestion
    {
      
            public string SiteID { get; set; }
            public int userID { get; set; }
        public DateTime ForDate { get; set; }
            public int? SequenceNo { get; set; }
            public string QuestionText { get; set; }
            public string ResponseText { get; set; }
       

    }
}
