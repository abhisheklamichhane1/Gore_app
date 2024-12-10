using Microsoft.AspNetCore.Mvc;
using TimesheetAPI.Services; // Make sure this is correct

namespace TimesheetAPI.Controllers
{
    [Route("api/settings")]
    [ApiController]
    public class SettingsController : ControllerBase
    {
        private readonly SettingsService _settingsService;

        public SettingsController(SettingsService settingsService)
        {
            _settingsService = settingsService;
        }

        [HttpGet("{siteID}")]
        public IActionResult GetSiteSettings(string siteID)
        {
            var settings = _settingsService.GetSiteDetails(siteID);
            if (settings == null)
                return NotFound("Site settings not found.");

            return Ok(settings);
        }
    }
}
