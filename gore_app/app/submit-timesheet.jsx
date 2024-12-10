import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Controller, useForm } from "react-hook-form";
import { useTasks } from "@/hooks/useTasks";
import { useUser } from "@/hooks/useUser";
import axios from "@/lib/axios";
import { useLocalSearchParams } from "expo-router";
import { useComments } from "@/hooks/useComments";

const getTimeSheetQuestions = async (siteID) => {
  const { data } = await axios.get(`/questions/${siteID}`);
  return data;
};

const answerTimeSheetQuestions = async (data) => {
  const response = await axios.post(`/questions`, data);
  return response;
};

const submitTimeSheet = async (data) => {
  const response = await axios.post("/dayoff/submit", data);
  return response;
};

const SubmitTimesheetScreen = () => {
  const { userData } = useUser();
  const { tasks, totalTime } = useTasks();
  const { comments, updateComments } = useComments();
  const { forDate } = useLocalSearchParams();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      comments: comments || "",
    },
  });

  // useEffect(() => {
  //   updateComments(comments);
  // }, [comments, updateComments]);

  const { data: questions } = useQuery({
    queryKey: ["TimeSheetQuestions"],
    queryFn: () => getTimeSheetQuestions(userData?.siteID),
    enabled: !!userData?.siteID,
  });
  const questionMutation = useMutation({
    mutationFn: answerTimeSheetQuestions,
    onSuccess: (data) => {},
  });
  const timeSheetMutation = useMutation({
    mutationFn: submitTimeSheet,
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const onSubmit = (data) => {
    const now = new Date();
    const brisbaneTime = formatInTimeZone(
      now,
      "Australia/Brisbane",
      "yyyy-MM-dd HH:mm:ssXXX"
    ); // Format to desired pattern

    const formattedData = {
      answers: Object.fromEntries(
        Object.entries(data)
          .filter(([key]) => !isNaN(Number(key)))
          .map(([key, value]) => [key, value])
      ),
      comment: comments,
    };

    const common = {
      userID: userData.userID,
      siteID: userData.siteID,
      forDate: format(brisbaneTime, "yyyy-MM-dd"),
    };

    const questionData = {
      ...common,
      answers: {
        ...formattedData.answers,
      },
    };

    const timeSheetData = {
      ...common,
      submitTime: brisbaneTime,
      uploadTime: brisbaneTime,
      dayoffreason: "",
      comments,
    };

    questionMutation.mutate(questionData);
    timeSheetMutation.mutate(timeSheetData);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Instructions */}
      <Text style={styles.instructions}>
        Finished for the day. Please complete the questions below and, if
        necessary, add any further comments. Then press the "Submit Timesheet"
        button above to submit this day’s timesheet.
      </Text>

      {/* Live Day Information */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          DAY: {format(new Date(), "EEEE dd MMMM yyyy")}
        </Text>
      </View>

      {/* Time Entry Section */}
      <View style={styles.timeEntryContainer}>
        <Text style={styles.sectionTitle}>Time Entry</Text>
        <View style={styles.timeRow}>
          <View style={styles.timeField}>
            <Text style={styles.label}>Start Time:</Text>
            <Text style={styles.value}>{tasks[0].startTime}</Text>
          </View>
          <View style={styles.timeField}>
            <Text style={styles.label}>Finish Time:</Text>
            <Text style={styles.value}>
              {tasks[tasks?.length - 1].finishTime}
            </Text>
          </View>
          <View style={styles.timeField}>
            <Text style={styles.label}>Total Time:</Text>
            <Text style={styles.value}>{totalTime}</Text>
          </View>
        </View>
      </View>

      {/* Eligibility Section */}
      <View style={styles.eligibilityContainer}>
        <Text style={styles.sectionTitle}>Questions</Text>

        {questions?.map((question) => (
          <View key={question.sequenceNo}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{question.questionText}</Text>
              <Controller
                control={control}
                name={`${question.sequenceNo}`}
                rules={{ required: "This field is required" }}
                defaultValue={question.defaultValue}
                render={({ field: { onChange, value } }) => (
                  <Picker
                    selectedValue={value}
                    onValueChange={(itemValue) => onChange(itemValue)}
                    style={styles.picker}
                  >
                    {question.responseCSV.split(",").map((option) => (
                      <Picker.Item key={option} label={option} value={option} />
                    ))}
                  </Picker>
                )}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Comments Section */}
      <View style={styles.commentsContainer}>
        <Text style={styles.sectionTitle}>Comments</Text>

        <Controller
          control={control}
          name="comments"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.textArea}
              value={value}
              onChangeText={onChange}
              placeholder="Add any additional notes here..."
              multiline
              numberOfLines={4}
            />
          )}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.submitText}>Submit Timesheet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#f4f6f8",
  },
  instructions: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 20,
    textAlign: "center",
  },
  headerContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0d6efd",
    textAlign: "center",
  },
  timeEntryContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderColor: "#ced4da",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeField: {
    alignItems: "flex-start",
    flex: 1,
    marginHorizontal: 5,
  },
  label: {
    fontSize: 14,
    color: "#495057",
  },
  value: {
    fontSize: 16,
    color: "#212529",
    fontWeight: "600",
    marginTop: 4,
  },
  eligibilityContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderColor: "#ced4da",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  picker: {
    height: 40,
    borderColor: "#ced4da",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    color: "#212529",
  },
  commentsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    borderColor: "#ced4da",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  textArea: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    fontSize: 16,
    color: "#212529",
    height: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#0d6efd",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  submitText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default SubmitTimesheetScreen;
