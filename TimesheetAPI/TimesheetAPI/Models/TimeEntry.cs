using System.ComponentModel;
using System.Text.Json.Serialization;
using System.Text.Json;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace TimesheetAPI.Models
{

   
    public class TimeEntry
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TimeSheetTasksID { get; set; } // Foreign key

        public string SiteID { get; set; }               // Identifier for the site
        public int UserID { get; set; }                 // Identifier for the user
        public DateTime ForDate { get; set; }           // Date for the time entry
        
       
        public string StartTime { get; set; }

        public string? FinishTime { get; set; }        // Finish time of the entry
        public string TimeFor { get; set; }             // E.g., Job, Smoko, Lunch, Travel
        public string JobNo { get; set; }               // Reference number for the job
        public string PlantNo { get; set; }             // Reference number for the plant
        public string SMHStart { get; set; }            // Clock card start
        public string SMHFinish { get; set; }           // Clock card finish
        public string WorkDone { get; set; }            // Description of work done

        // Computed property for total time

       

        //public string TotalTime => (FinishTime - StartTime).ToString(@"hh\:mm");

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
