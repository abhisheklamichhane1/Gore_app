import { useTasks } from "@/hooks/useTasks";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

function HomeDateTime() {
  const { activePastTSIndex, pastTSDates, viewPastTimeSheet } = useTasks();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update current time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  return (
    <View style={styles.dateContainer}>
      <Text style={styles.dateText}>
        {viewPastTimeSheet
          ? format(
              new Date(pastTSDates[activePastTSIndex]),
              "EEEE, MMM d, yyyy"
            )
          : format(new Date(), "EEEE, MMM d, yyyy")}
      </Text>

      {!viewPastTimeSheet && (
        <Text style={styles.timeText}>
          Time: {currentTime.toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dateContainer: {
    padding: 12,
    backgroundColor: "#f39c12",
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  dateText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  timeText: {
    fontSize: 18,
    color: "#fff",
  },
});

export default HomeDateTime;
