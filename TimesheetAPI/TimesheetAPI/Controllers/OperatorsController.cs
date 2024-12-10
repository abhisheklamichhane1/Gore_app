using Microsoft.AspNetCore.Mvc;
using TimesheetAPI.Services; // Ensure this matches the exact namespace of AuthenticationService

namespace TimesheetAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class OperatorsController : ControllerBase
    {
        private readonly AuthenticationService _authService;

        public OperatorsController(AuthenticationService authService)
        {
            _authService = authService;
        }

        //[HttpPost("login")]
        //public IActionResult Login([FromBody] LoginRequest loginRequest)
        //{
        //    var authenticatedOperator = _authService.Login(loginRequest.SiteID, loginRequest.PIN);
        //    if (authenticatedOperator == null)
        //    {
        //        return Unauthorized("Invalid Site ID or PIN.");
        //    }
        //    return Ok(new
        //    {
        //        OperatorID = authenticatedOperator.OperatorID,
        //        UserName = authenticatedOperator.UserName,
        //        SiteID = authenticatedOperator.SiteID
        //    });
        //}

        // POST /api/auth/login


        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest loginRequest)
        {
            var response = _authService.Login(loginRequest.SiteID, loginRequest.UserName, loginRequest.PIN);

            if (!response.IsAuthenticated)
            {
                // Customize the response message for incorrect PIN
                var message = response.Message.Contains("PIN")
                    ? "Incorrect PIN, Please try again"
                    : response.Message;

                return Unauthorized(message);
            }

            return Ok(new
            {
                response.IsAuthenticated,
                response.Message,
                //response.OperatorID,
                response.UserName,
                response.SiteID,
                response.UserID,
                response.TimeEntryType,
                response.DisplayName,
                response.SiteName
                
                
                // NextPage = "/day-start" // Define the next page
            });
        }
    }
}
