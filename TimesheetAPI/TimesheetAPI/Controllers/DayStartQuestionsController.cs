using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimesheetAPI.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace TimesheetAPI.Controllers
{
    [Route("api/[controller]")]
    public class DayStartQuestionsController : Controller
    {
        private readonly TimeSheetDbContext _context;

        public DayStartQuestionsController(TimeSheetDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> PostDayStartResponses([FromBody] TimesheetDayStartQuestionDto request)
        {
            if (request == null || request.answers == null || !request.answers.Any())
            {
                return BadRequest(new { message = "Invalid or empty response data." });
            }

            try
            {
                // Loop through each answer in the provided dictionary
                foreach (var answer in request.answers)
                {
                    var sequenceNo = int.Parse(answer.Key);
                    var responseText = answer.Value;

                    // Fetch the QuestionText for the given SequenceNo
                    var questionDefinition = await _context.TimesheetDayStartQuestions
                        .Where(q => q.SequenceNo == sequenceNo)
                        .Select(q => new { q.QuestionText })
                        .FirstOrDefaultAsync();

                    if (questionDefinition == null)
                    {
                        return BadRequest(new { message = $"No question found in the database for SequenceNo {sequenceNo}." });
                    }

                    // Create a new question entry
                    var question = new TimesheetDayStartQuestion
                    {
                        SiteID = request.siteID,
                        UserID = request.userID,
                        ForDate = DateTime.Now,  // Assuming you want to use the current date
                        SequenceNo = sequenceNo,
                        QuestionText = questionDefinition.QuestionText,
                        ResponseText = responseText
                    };

                    // Add the new question entry to the database
                    _context.TimesheetDayStartQuestions.Add(question);
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




        [HttpGet]
        public async Task<IActionResult> GetDayStartQuestions()
        {
            // Fetch the list of questions from the database
            var questions = await _context.DayStartQuestions.ToListAsync();

            if (!questions.Any())
            {
                return NotFound("No Day Start Questions found.");
            }

            // Prepare the response DTO
            var response = questions.Select(q => new DayStartQuestionDto
            {
                SequenceNo = q.SequenceNo ?? 0,
                QuestionText = q.QuestionText,
                DropdownValues = q.ResponseCSV?.Split(',').ToList() ?? new List<string>(),
                DefaultValue = q.DefaultValue,
                Mandatory = q.Mandatory // The Mandatory property is already converted to bool
            });

            return Ok(response);
        }
    }
}
