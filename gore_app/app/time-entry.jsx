import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import timeUtils from '../utils/timeUtils';
import axios from '../lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { format, formatISO, parse } from "date-fns"
import { formatInTimeZone, zonedTimeToUtc } from "date-fns-tz"
import { useUser } from '@/hooks/useUser';

// Constants
const TIME_TYPES = {
  JOB: "job",
  SMOKO: "smoko",
  LUNCH: "lunch",
  TRAVEL: "travel",
};

const TIME_OPTIONS = [
  { label: "Job", value: TIME_TYPES.JOB },
  { label: "Smoko", value: TIME_TYPES.SMOKO },
  { label: "Lunch", value: TIME_TYPES.LUNCH },
  { label: "Travel", value: TIME_TYPES.TRAVEL },
];

// Zod Schema
const timeEntrySchema = z.object({
  timeFor: z.enum([TIME_TYPES.JOB, TIME_TYPES.SMOKO, TIME_TYPES.LUNCH, TIME_TYPES.TRAVEL], {
    required_error: "Please select a time type",
  }),
  startTime: z.string().min(1, "Start time is required"),
  finishTime: z.string().optional(),
  jobNo: z.string().min(1, "Job number is required"),
  plantNo: z.string().min(1, "Plant number is required"),
  workDone: z.string()
    .min(10, "Work details must be at least 10 characters long")
    .max(500, "Work details must not exceed 500 characters"),
  smhStart: z.string().optional(),
  smhFinish: z.string().optional(),
}).refine((data) => {
  if (data.finishTime) {
    return data.startTime < data.finishTime;
  }
  return true;
}, {
  message: "Finish time must be after start time",
  path: ["finishTime"],
});

const getTimeSheetTask = async (task) => {
  const response = await axios.get(`/TimeEntry/${task}`);
  return response.data;
};

const createOrUpdateTimeSheetTask = async (data) => {
  const response = await axios.post('/TimeEntry', data);
  return response.data;
};

const defaultFormValues = (mode, taskDetail) => ({
  timeFor: taskDetail?.timeFor || '',
  startTime: mode === "clock_on" ? timeUtils.getCurrentTime() : taskDetail?.startTime || '',
  finishTime: mode === "clock_off" ? timeUtils.getCurrentTime() : taskDetail?.finishTime || '',
  jobNo: taskDetail?.jobNo || '',
  plantNo: taskDetail?.plant || '',
  workDone: taskDetail?.workDone || '',
  smhStart: taskDetail?.smhStart || '',
  smhFinish: taskDetail?.smhFinish || '',
});

const TimeEntryScreen = () => {
  const { userData } = useUser();
  const { mode, task } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [showPicker, setShowPicker] = React.useState({ start: false, finish: false });

  const { data: taskDetail, isLoading } = useQuery({
    queryKey: ['taskDetail', task],
    queryFn: () => getTimeSheetTask(task),
    enabled: !!task,
  });

  const handleClockActivity = (mode, taskDetail, prop) => {
    if (taskDetail?.startTime && prop === "startTime") {
      return taskDetail[prop];
    } else if (taskDetail?.finishTime && prop === "finishTime") {
      return taskDetail[prop];
    }

    return "";
  };

  const { control, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: defaultFormValues(mode, {}),
  });

  useEffect(() => {
    if (taskDetail) {
      reset(defaultFormValues(mode, taskDetail));
    }
  }, [taskDetail, mode, reset]);

  const startTime = watch('startTime');
  const finishTime = watch('finishTime');
  const [totalTime, setTotalTime] = React.useState('HH:MM');

  const timeSheetTaskMutation = useMutation({
    mutationFn: createOrUpdateTimeSheetTask,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['todayEntries', userData?.userID, userData?.siteID] });
      router.back();
      Alert.alert("Success", "Time entry submitted successfully!");
    },
    onError: (error) => {
      console.log(error);
      Alert.alert("Error", "Failed to submit time entry. Please try again.");
    },
  });

  const onSubmit = (data) => {
    console.log("is submitting");

    if (!userData) return;

    if (mode === "read-only") {
      return Alert.alert("Info", "Past Timesheets cannot be re-submitted!");
    }

    const now = new Date();
    const brisbaneTime = formatInTimeZone(now, 'Australia/Brisbane', 'yyyy-MM-dd HH:mm:ssXXX'); // Format to desired pattern
    
    // const utcDate = fromZonedTime(new Date(), 'Australia/Brisbane');
    // return console.log(utcDate);
    
    // return console.log(new Date(brisbaneTime).toISOString());

    const dataToSave = {
      userID: userData.userID,
      siteID: userData.siteID,
      forDate: format(brisbaneTime, 'yyyy-MM-dd'),
      ...data,
      totalTime: mode === 'clock_off' ? totalTime : '',
    };

    // Modify submission based on mode
    if (mode === "clock_on") {
      delete dataToSave.finishTime;
      delete dataToSave.totalTime;
    }

    if (task) {
      dataToSave.timeSheetTasksId = task;
    }

    timeSheetTaskMutation.mutate(dataToSave);
  };

  const handlePickerChange = (type, event, selectedDate) => {
    setShowPicker((prev) => ({ ...prev, [type]: false }));

    if (!selectedDate || event.type === 'dismissed') return;

    const formattedTime = selectedDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    setValue(type === 'start' ? 'startTime' : 'finishTime', formattedTime);
  };

  useEffect(() => {
    if (startTime && finishTime) {
      const timeDifference = timeUtils.calculateTimeDifference(startTime, finishTime);
      setTotalTime(timeDifference);
    }
  }, [startTime, finishTime]);

  if (isLoading) {
    return <Text>Loading...</Text>
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Time Entry</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Time For</Text>
        <Controller
          control={control}
          name="timeFor"
          render={({ field: { onChange, value } }) => (
            <RNPickerSelect
              placeholder={{ label: 'Select Time Type...', value: '' }}
              value={value}
              onValueChange={onChange}
              items={TIME_OPTIONS}
              disabled={mode === "read-only"}
              style={{
                inputIOS: styles.input,
                inputAndroid: styles.input,
              }}
              useNativeAndroidPickerStyle={false}
            />
          )}
        />
        {errors.timeFor && (
          <Text style={styles.errorText}>{errors.timeFor.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Start Time</Text>
        <Controller
          control={control}
          name="startTime"
          // disabled={mode === "clock_on" || mode === "clock_off"}
          render={({ field: { value } }) => (
            <TouchableOpacity
              onPress={() => setShowPicker((prev) => ({ ...prev, start: true }))}
              disabled={mode === "clock_on" || mode === "clock_off" || mode === "read-only"}
            >
              <Text style={styles.input}>{value || 'Select Start Time'}</Text>
            </TouchableOpacity>
          )}
        />
        {errors.startTime && (
          <Text style={styles.errorText}>{errors.startTime.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Finish Time</Text>
        <Controller
          control={control}
          name="finishTime"
          render={({ field: { value } }) => (
            <TouchableOpacity
              onPress={() => setShowPicker((prev) => ({ ...prev, finish: true }))}
              disabled={mode === "clock_on" || mode === "clock_off" || mode === "read-only"}
            >
              <Text style={styles.input}>{value || 'Select Finish Time'}</Text>
            </TouchableOpacity>
          )}
        />
        {errors.finishTime && (
          <Text style={styles.errorText}>{errors.finishTime.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Total Time</Text>
        <Text style={styles.nonEditableInput}>{totalTime}</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Job No</Text>
        <Controller
          control={control}
          name="jobNo"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              readOnly={mode === "read-only"}
              value={value}
              onChangeText={onChange}
              placeholder="Enter Job No"
            />
          )}
        />
        {errors.jobNo && (
          <Text style={styles.errorText}>{errors.jobNo.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Plant No</Text>
        <Controller
          control={control}
          name="plantNo"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              readOnly={mode === "read-only"}
              value={value}
              onChangeText={onChange}
              placeholder="Enter Plant No"
            />
          )}
        />
        {errors.plantNo && (
          <Text style={styles.errorText}>{errors.plantNo.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Details of Work</Text>
        <Controller
          control={control}
          name="workDone"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea]}
              readOnly={mode === "read-only"}
              value={value}
              onChangeText={onChange}
              placeholder="Describe work performed, including labor"
              multiline
            />
          )}
        />
        {errors.workDone && (
          <Text style={styles.errorText}>{errors.workDone.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>SMH Start</Text>
        <Controller
          control={control}
          name="smhStart"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              readOnly={mode === "read-only"}
              value={value}
              onChangeText={onChange}
              placeholder="Enter SMH Start"
            />
          )}
        />
        {errors.smhStart && (
          <Text style={styles.errorText}>{errors.smhStart.message}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>SMH Finish</Text>
        <Controller
          control={control}
          name="smhFinish"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              readOnly={mode === "read-only"}
              value={value}
              onChangeText={onChange}
              placeholder="Enter SMH Finish"
            />
          )}
        />
        {errors.smhFinish && (
          <Text style={styles.errorText}>{errors.smhFinish.message}</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit(onSubmit)}
        disabled={timeSheetTaskMutation.isPending}
      >
        <Text style={styles.submitText}>
          Submit
        </Text>
      </TouchableOpacity>

      {showPicker.start && (
        <DateTimePicker
          mode="time"
          is24Hour
          value={parse(taskDetail?.startTime, 'HH:mm', new Date()) || new Date()}
          display='spinner'
          onChange={(event, date) => handlePickerChange('start', event, date)}
        />
      )}

      {showPicker.finish && (
        <DateTimePicker
          mode="time"
          is24Hour
          value={parse(taskDetail?.finishTime, 'HH:mm', new Date()) || new Date()}
          display='spinner'
          onChange={(event, date) => handlePickerChange('finish', event, date)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0a84ff',
    marginBottom: 25,
    textAlign: 'center',
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nonEditableInput: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 12,
    backgroundColor: '#e6f2ff',
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  textArea: {
    height: 100,
  },
  submitButton: {
    paddingVertical: 12,
    backgroundColor: '#28a745',
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 4,
  },
});

export default TimeEntryScreen;