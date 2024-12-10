import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useTasks } from "@/hooks/useTasks";
import timeUtils from "@/utils/timeUtils";
import { router } from "expo-router";

const renderTaskItem = ({ item }) => (
  <View style={styles.taskItem}>
    <Text>Task: {item.description}</Text>
    <Text>Start: {item.startTime.toLocaleTimeString()}</Text>
    <Text>
      Finish:{" "}
      {item.finishTime ? item.finishTime.toLocaleTimeString() : "In Progress"}
    </Text>
  </View>
);

const TimeSheet = ({ tasks }) => {
  const { pastTSDates, viewPastTimeSheet, totalTime } = useTasks();
  
  // Convert a time in "hours:minutes" format to "Xh Ym" format
  // const formatTime = (time) => {
  //   const [hours, minutes] = time.split(":").map(Number);
  //   return `${hours}h ${minutes}m`;
  // };

  // Calculate total time by summing the duration of each task
  // const calculateTotalTime = () => {
  //   let totalHours = 0;
  //   let totalMinutes = 0;

  //   tasks.forEach((task) => {
  //     const [hours, minutes] = task.time.split(":").map(Number);
  //     totalHours += hours;
  //     totalMinutes += minutes;
  //   });

  //   totalHours += Math.floor(totalMinutes / 60);
  //   totalMinutes = totalMinutes % 60;

  //   return `${totalHours}h ${totalMinutes}m`;
  // };

  const editTask = (taskID, index) => {
    if (!viewPastTimeSheet) {
      const finishTime = tasks[index]?.finishTime;

      if (!finishTime) return;
    }

    const queryParams = new URLSearchParams({
      task: taskID,
      ...(viewPastTimeSheet && { mode: 'read-only' })
     });
     
     router.push(`/time-entry?${queryParams}`);
  }
  
  return (
    <View style={styles.container}>
      {/* Table Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerCell}>Start</Text>
        <Text style={styles.headerCell}>Finish</Text>
        <Text style={styles.headerCell}>Time</Text>
        <Text style={styles.headerCell}>Job</Text>
        <Text style={styles.headerCell}>Plant</Text>
      </View>

      {/* Table Rows */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.timeSheetTasksID}
        renderItem={({ item, index }) => (
          <TouchableOpacity style={[styles.row, viewPastTimeSheet && styles.pastTSRow]} onPress={() => editTask(item.timeSheetTasksID, index)}>
            <Text style={styles.cell}>{item.startTime}</Text>
            <Text style={styles.cell}>{item?.finishTime}</Text>
            <Text style={styles.cell}>{timeUtils.calculateTimeDifference(item.startTime, item?.finishTime) || "In Progress"}</Text>
            <Text style={styles.cell}>{item.jobNo}</Text>
            <Text style={styles.cell}>{item.plant}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Total Time Row */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel} colSpan={2}>
          Total Time
        </Text>
        <Text style={styles.totalValue}>{totalTime || "In Progress"}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 5,
  },
  headerCell: {
    flex: 1,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  pastTSRow: {
    backgroundColor: "#dedede"
  },  
  cell: {
    flex: 1,
    textAlign: "center",
    color: "#333",
  },
  totalRow: {
    flexDirection: "row",
    paddingVertical: 10,
    backgroundColor: "#eee",
    borderTopWidth: 2,
    borderColor: "#ddd",
  },
  totalLabel: {
    flex: 2, // Span across two columns
    fontWeight: "bold",
    textAlign: "center",
  },
  totalValue: {
    flex: 3, // Span remaining columns
    textAlign: "center",
    color: "#333",
  },
});

export default TimeSheet;
