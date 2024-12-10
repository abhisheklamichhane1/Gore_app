const timeUtils = {
  getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  },

  convertTo24HourFormat(time) {
    // First check if it's already in 24-hour format
    if (time && !time.includes(" ")) {
      const [hours, minutes] = time.split(":").map(Number);
      return [hours, minutes];
    }

    // Handle 12-hour format with AM/PM
    if (!time || !time.includes(" ")) return [NaN, NaN];

    const [timePart, period] = time.split(" ");
    const [hours, minutes] = timePart.split(":").map(Number);

    let adjustedHours = hours;
    if (period === "PM" && hours !== 12) adjustedHours += 12;
    if (period === "AM" && hours === 12) adjustedHours = 0;

    return [adjustedHours, minutes];
  },

  convertToDateTime(timeString) {
    const [hours, minutes] = timeString
      .split(":")
      .map((num) => parseInt(num, 10));

    // Create a new date in UTC
    const now = new Date();
    const utcDate = new Date(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hours,
      minutes,
      0, // seconds
      0 // milliseconds
    );

    // Adjust to Australian Eastern Standard Time (AEST, UTC+10)
    const offsetInHours = 10; // Adjust for AEST
    utcDate.setHours(utcDate.getHours() + offsetInHours);

    return utcDate;
  },

  calculateTimeDifference(start, finish) {
    if (!start || !finish) return;

    try {
      const [startHours, startMinutes] = this.convertTo24HourFormat(start);
      const [finishHours, finishMinutes] = this.convertTo24HourFormat(finish);

      if (isNaN(startHours) || isNaN(finishHours)) {
        throw new Error("Invalid time format");
      }

      const startInMinutes = startHours * 60 + startMinutes;
      const finishInMinutes = finishHours * 60 + finishMinutes;

      let diffInMinutes = finishInMinutes - startInMinutes;
      if (diffInMinutes < 0) diffInMinutes += 24 * 60; // Handle overnight

      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;

      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error("Time calculation error:", error);
      return "Invalid Time";
    }
  },
};

export default timeUtils;
