using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using TimesheetAPI.Models;

public class TimeSheetDbContext : DbContext
{
    public TimeSheetDbContext(DbContextOptions<TimeSheetDbContext> options) : base(options) { }

    public DbSet<Operator> Operators { get; set; }
    public DbSet<TimeSheets> TimeSheets { get; set; }
    public DbSet<TimeSheetTasks> TimeSheetTasks { get; set; }
    public DbSet<SiteDetail> SiteDetails { get; set; }
    public DbSet<TimeEntry> TimeEntries { get; set; }
    public DbSet<DayStartQuestion> DayStartQuestions { get; set; }
    public DbSet<TimesheetDayStartQuestion> TimesheetDayStartQuestions { get; set; }

    public DbSet<SubmitQuestions> SubmitsQuestions { get; set; }

    public DbSet<TimesheetSubmitQuestion> TimesheetSubmitQuestions { get; set; }






    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        modelBuilder.Entity<TimesheetSubmitQuestion>()
           .HasKey(t => new { t.SiteID, t.SequenceNo });

        modelBuilder.Entity<SubmitQuestions>()
        .HasKey(q => new { q.SiteID, q.SequenceNo });  // Composite key
        modelBuilder.Entity<SubmitQuestions>()
            .ToTable("SubmitQuestions");  // Use the actual table name here
        modelBuilder.Entity<SubmitQuestions>()
      .Property(q => q.Mandatory)
      .HasConversion(
                      v => v ? (byte)1 : (byte)0,  // Convert bool to byte
                      v => v == 1);  // Converts byte to int if necessary, or use .HasConversion<bool>() for bool


        modelBuilder.Entity<TimesheetDayStartQuestion>()
        .HasKey(q => q.SequenceNo); // Use SequenceNo as the primary key

        // Configure the DayStartQuestion entity
        modelBuilder.Entity<DayStartQuestion>(entity =>
        {
            // Composite primary key configuration (if needed)
            entity.HasKey(e => new { e.SequenceNo });

            // Other properties
            entity.Property(e => e.QuestionText).IsRequired();
            entity.Property(e => e.ResponseCSV).HasColumnType("nvarchar(max)");
            entity.Property(e => e.DefaultValue).HasColumnType("nvarchar(50)");

            // Value converter to handle byte to bool conversion
            entity.Property(e => e.Mandatory)
                  .HasConversion(
                      v => v ? (byte)1 : (byte)0,  // Convert bool to byte
                      v => v == 1);  // Convert byte back to bool
        });



        // Composite primary key for Operators table
        modelBuilder.Entity<Operator>()
            .HasKey(o => new { o.SiteID, o.UserID });

        // Composite primary key for TimeEntries table
        modelBuilder.Entity<TimeEntry>()
            .HasKey(e => new { e.SiteID, e.UserID, e.ForDate, e.StartTime, e.TimeSheetTasksID });
    

        // Composite primary key for TimeSheetTasks table
        modelBuilder.Entity<TimeSheetTasks>()
            .HasKey(t => new { t.SiteID, t.UserID, t.ForDate, t.TimeSheetTasksID });

        // Composite primary key for Timesheets table
        modelBuilder.Entity<TimeSheets>()
            .HasKey(t => new { t.SiteID, t.ForDate, t.UserID });

        // TimeEntry entity mapping
        modelBuilder.Entity<TimeEntry>(entity =>
        {
            entity.Property(e => e.StartTime).HasColumnName("StartTime");
            entity.Property(e => e.FinishTime).HasColumnName("FinishTime");
            entity.Property(e => e.JobNo).HasColumnName("Job");
            entity.Property(e => e.PlantNo).HasColumnName("Plant");
        });

        // SiteDetail entity mapping
        modelBuilder.Entity<SiteDetail>(entity =>
        {
            entity.Property(e => e.SiteID).HasColumnName("SiteID");
            entity.Property(e => e.SiteName).HasColumnName("SiteName");
            //entity.Property(e => e.TimeFormat).HasColumnName("TimeFormat");
           // entity.Property(e => e.TimeZone).HasColumnName("TimeZone");

            // Uncomment this if TimeFormat exists in the database
            // Otherwise, comment or remove the following line
            // entity.Property(e => e.TimeFormat).HasColumnName("TimeFormat");
        });

        // Primary key for SiteDetails table
        modelBuilder.Entity<SiteDetail>()
            .HasKey(o => o.SiteID);

        base.OnModelCreating(modelBuilder);
    }
}