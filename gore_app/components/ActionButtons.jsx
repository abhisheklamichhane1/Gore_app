import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTasks } from "@/hooks/useTasks";
import { router } from "expo-router";
import { useUser } from "@/hooks/useUser";

function ActionButtons() {
  const { userData } = useUser();
  const {
    tasks,
    isTSLoading,
    viewPastTimeSheet,
    pastTSDates,
    activePastTSIndex,
    handlePastTSNav,
  } = useTasks();

  const [manualEntry, setManualEntry] = useState(false); // State to toggle manual entry

  useEffect(() => {
    if (userData?.timeEntryType === "M") {
      setManualEntry(true);
    } else {
      setManualEntry(false);
    }
  }, [userData]); // Re-run when userData changes

  const handleClockOn = () => {
    router.push("/time-entry?mode=clock_on");
  };

  const checkUnfinishedTask = () => {
    const startTimeWithEmptyFinishTime = tasks?.find(
      (task) => task.finishTime === null
    )?.timeSheetTasksID;

    return startTimeWithEmptyFinishTime; // Output: "16:45"
  };

  const handleClockOff = () => {
    const unfinishedTask = checkUnfinishedTask();

    if (tasks?.length < 1 || !unfinishedTask) {
      Alert.alert("Info", "No task to clock off.");
      return;
    }

    router.push(`/time-entry?mode=clock_off&task=${unfinishedTask}`);
  };

  const handleManualEntry = () => {
    router.push("/time-entry?mode=manual");
  };

  const handleSubmit = () => {
    if (viewPastTimeSheet) {
      return router.push(`/submit-timesheet?forDate=${pastTSDates[activePastTSIndex]}`);
    }

    if (tasks?.length > 0) {
      router.push("/submit-timesheet");
    } else {
      router.push("/day-off");
    }
  };

  return (
    <View style={styles.buttonRow}>
      {viewPastTimeSheet ? (
        <>
          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={() => handlePastTSNav("prev")}
            disabled={activePastTSIndex === 0}
          >
            <Text style={styles.buttonText}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={() => handlePastTSNav("next")}
            disabled={pastTSDates?.length === activePastTSIndex + 1}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={isTSLoading}
          >
            <Text style={styles.buttonText}>
              Submitted
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {manualEntry ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleManualEntry}
              >
                <Text style={styles.buttonText}>Add Time</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={isTSLoading}
              >
                <Text style={styles.buttonText}>
                  {tasks?.length > 0 ? "Submit" : "Day Off"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, styles.clockOnButton]}
                onPress={handleClockOn}
              >
                <Text style={styles.buttonText}>Clock on</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.clockOffButton]}
                onPress={handleClockOff}
              >
                <Text style={styles.buttonText}>Clock off</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={isTSLoading}
              >
                <Text style={styles.buttonText}>
                  {tasks?.length > 0 ? "Submit" : "Day Off"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  clockOnButton: {
    backgroundColor: "#2ecc71",
  },
  clockOffButton: {
    backgroundColor: "#e74c3c",
  },
  addButton: {
    backgroundColor: "#3498db",
  },
  submitButton: {
    backgroundColor: "#f39c12",
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
});

export default ActionButtons;
