namespace TimesheetAPI.Models
{
    public class ClockInRequest
    {
        public string JobNo { get; set; }
        public string SiteID { get; set; }
        public int UserID { get; set; }
        public string StartTime { get; set; }  // Start time in "HHmm" format
        public string FinishTime { get; set; } // Finish time in "HHmm" format (optional, null for now)
        public string TimeFor { get; set; }
        public string ReferenceNo1 { get; set; } // ReferenceNo1 for PlantNo
        public string ReferenceNo2 { get; set; } // ReferenceNo2 for SMHStart
        public string ReferenceNo3 { get; set; } // ReferenceNo3 for SMHFinish
        public string WorkDone { get; set; }



    }
}
