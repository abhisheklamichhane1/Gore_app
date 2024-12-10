using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace TimesheetAPI.Models
{
    public class TimeSheetTasks
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int? TimeSheetTasksID { get; set; }


        public string? JobNo { get; set; }

        public string SiteID { get; set; }       // Matches SiteID column
        public int UserID { get; set; }          // Matches UserID column
        public DateTime ForDate { get; set; }    // Matches ForDate column
        public string StartTime { get; set; }    // Matches StartTime column (stored as "HHmm")
        public string? FinishTime { get; set; }   // Matches FinishTime column (stored as "HHmm")
        public string TimeFor { get; set; }      // Matches TimeFor column
                                                 // public string JobNo { get; set; }        // Matches JobNo column
        public string ReferenceNo1 { get; set; } // Matches ReferenceNo1 column (for PlantNo)
        public string ReferenceNo2 { get; set; } // Matches ReferenceNo2 column (for SMH Start)
        public string ReferenceNo3 { get; set; } // Matches ReferenceNo3 column (for SMH Finish)
        public string WorkDone { get; set; }     // Matches WorkDone column

        // Computed property for total time


        

        public double TotalTime => CalculateTotalTime();

     
        private double CalculateTotalTime()
        {
            if (DateTime.TryParse(FinishTime, out var finishTime) &&
                DateTime.TryParse(StartTime, out var startTime))
            {
                return (finishTime - startTime).TotalHours;
            }
            return 0;
        }

       
    }
}
