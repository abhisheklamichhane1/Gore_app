using Microsoft.EntityFrameworkCore.Metadata.Internal;

public class Operator
{
    
    public int UserID { get; set; }
    public string SiteID { get; set; }
    public string UserName { get; set; }
    public string DisplayName { get; set; }
    public string PIN { get; set; }

    public string TimeEntryType { get; set; } // "C" for clock, "M" for manual
}


