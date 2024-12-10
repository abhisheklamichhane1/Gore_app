public class SettingsService
{
    private readonly TimeSheetDbContext _context;

    public SettingsService(TimeSheetDbContext context)
    {
        _context = context;
    }

    public SiteDetail GetSiteDetails(string siteID)
    {
        Console.WriteLine($"Searching for SiteID: {siteID}");
        var result =_context.SiteDetails.FirstOrDefault(s => s.SiteID == siteID);
        if (result == null)
        {
            Console.WriteLine("No matching site details found.");
        }
        return result;
    }
}
