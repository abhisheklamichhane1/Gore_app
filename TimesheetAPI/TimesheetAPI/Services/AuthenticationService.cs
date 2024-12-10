using Microsoft.EntityFrameworkCore;
using TimesheetAPI.Models;
using System;
using System.Linq;

namespace TimesheetAPI.Services
{
    public class AuthenticationService
    {
        private readonly TimeSheetDbContext _dbContext;

        public AuthenticationService(TimeSheetDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Login method to verify SiteID, UserName, and PIN
        public LoginResponse Login(string siteID, string userName, string pin)
        {
            // Find the user in the Operators table based on SiteID, UserName, and PIN
            var user = _dbContext.Operators
                .FirstOrDefault(u => u.SiteID == siteID && u.UserName == userName && u.PIN == pin);


            // Fetch the SiteName from the SiteDetails table using the SiteID
            var siteDetail = _dbContext.SiteDetails
                .FirstOrDefault(s => s.SiteID == siteID);

            // If SiteName is not found, set a default value (or handle it as needed)
            string siteName = siteDetail?.SiteName ?? "Unknown Site";
            if (user == null)
            {
                return new LoginResponse
                {
                    IsAuthenticated = false,
                    Message = "Incorrect user name, PIN, or Site ID"
                };
            }


            if (siteDetail == null)
            {
                return new LoginResponse
                {
                    IsAuthenticated = false,
                    Message = "Site details not found"
                };
            }

            return new LoginResponse
            {
                IsAuthenticated = true,
                Message = "Login successful",
                UserName = user.UserName,
                SiteID = user.SiteID,
                UserID=user.UserID,
                SiteName = siteName, // Add SiteName to the response


                DisplayName =user.DisplayName,
                TimeEntryType = user.TimeEntryType


            };
        }
    }
}