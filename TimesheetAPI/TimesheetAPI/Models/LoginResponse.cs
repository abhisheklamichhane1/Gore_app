namespace TimesheetAPI.Models
{
    public class LoginResponse
    {
        public bool IsAuthenticated { get; set; }       // True if authentication is successful
        public string Message { get; set; }             // Message indicating success or failure
        public string NextScreen { get; set; }          // Indicates the next screen to show (e.g., "DayStart", "MainScreen", "ReadOnly")
        public TimesheetDetails Timesheet { get; set; } // Details of today’s timesheet if needed

        public string OperatorID { get; set; } // Assuming this is a string
        public string UserName { get; set; }
        public string SiteID { get; set; }
        public int UserID { get; set; }
        public string TimeEntryType { get; set; }
        public string DisplayName { get; set; }
        public string SiteName { get; set; }
        

    }

    public class TimesheetDetails
    {
        public string SiteID { get; set; }
        public string SiteName { get; set; } // This column should be present in your database
        //public string TimeFormat { get; set; }
        //public int PINSize { get; set; }
       // public string TimeZone { get; set; }
    }
}
