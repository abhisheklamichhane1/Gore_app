using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimesheetAPI.Models;


namespace TimesheetAPI.Controllers
{
    [ApiController]
    [Route("api/questions")]
    public class QuestionsController : Controller
    {
        private readonly TimeSheetDbContext _context;  // Your DbContext class

        public QuestionsController(TimeSheetDbContext context)
        {
            _context = context;
        }

        // GET: api/questions/DevTeamTarkov
        [HttpGet("{siteId}")]
        public async Task<IActionResult> GetQuestionsBySite(string siteId)
        {
            if (string.IsNullOrEmpty(siteId))
            {
                return BadRequest(new { message = "SiteID is required." });
            }

            try
            {
                // Fetch the questions matching the provided SiteID and order by SequenceNo
                var questions = await _context.SubmitsQuestions
                    .Where(q => q.SiteID == siteId)
                    .OrderBy(q => q.SequenceNo)
                    .ToListAsync();

                if (!questions.Any())
                {
                    return NotFound(new { message = $"No questions found for the SiteID: {siteId}." });
                }

                return Ok(questions);
            }
            catch (Exception ex)
            {
                // Handle any unexpected errors
                return StatusCode(500, new { message = "An error occurred while fetching the questions.", details = ex.Message });
            }
        }



        [HttpPost]
        public async Task<IActionResult> PostTimesheetSubmitQuestion([FromBody] TimesheetSubmitQuestionDto request)
        {
            if (request == null || request.Answers == null || !request.Answers.Any())
            {
                return BadRequest(new { message = "Invalid or empty response data." });
            }

            try
            {
                // Process the answers
                foreach (var answer in request.Answers)
                {
                    var sequenceNo = int.Parse(answer.Key);  // Sequence number from the answer key
                    var responseText = answer.Value;  // Response text for that particular sequence number

                    // Fetch the QuestionText for the given SequenceNo
                    var questionDefinition = await _context.TimesheetSubmitQuestions
                        .Where(q => q.SequenceNo == sequenceNo)
                        .Select(q => new { q.QuestionText })
                        .FirstOrDefaultAsync();

                    if (questionDefinition == null)
                    {
                        return BadRequest(new { message = $"No question found in the database for SequenceNo {sequenceNo}." });
                    }

                    // Create a new question entry
                    var question = new TimesheetSubmitQuestion
                    {
                        SiteID = request.SiteID,
                        userID = request.userID,
                        ForDate = request.ForDate,  // Use the provided ForDate
                        SequenceNo = sequenceNo,
                        QuestionText = questionDefinition.QuestionText,
                        ResponseText = responseText
                    };

                    // Add the new question entry to the database
                    _context.TimesheetSubmitQuestions.Add(question);
                }

                // Save changes to the database
                await _context.SaveChangesAsync();

                // Return success response
                return Ok(new { message = "Responses inserted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while inserting responses.", details = ex.Message });
            }
        }





    }
}
