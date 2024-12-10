import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useComments } from '@/hooks/useComments';

const DayOffScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dayOffReason, setDayOffReason] = useState('');
  const { comments } = useComments();

  // Handler for date selection
  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  // Submit handler
  const handleSubmit = () => {
    // Add submission logic here
    console.log({
      ForDate: selectedDate,
      DayOffReason: dayOffReason,
      Comments: comments,
    });
    alert('Day Off Submitted Successfully!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.instructions}>
        If you are taking a day off, please complete the details below. Add the reason for the day off, optional comments,
        and submit the form to record your day off.
      </Text>

      {/* Date Picker Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Select Date:</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.datePickerButton}
        >
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

      {/* Day Off Reason Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Reason for Day Off:</Text>
        <Picker
          selectedValue={dayOffReason}
          onValueChange={(itemValue) => setDayOffReason(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select a reason" value="" />
          <Picker.Item label="Personal Leave" value="Personal Leave" />
          <Picker.Item label="Sick Leave" value="Sick Leave" />
          <Picker.Item label="Vacation" value="Vacation" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      {/* Comments Section */}
      <View style={styles.section}>
        <Text style={styles.label}>Additional Comments:</Text>
        <TextInput
          style={styles.textArea}
          value={comments}
          readOnly
          placeholder="Add any additional details here..."
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Day Off</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f4f6f8',
  },
  instructions: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderColor: '#ced4da',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 10,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#212529',
  },
  picker: {
    height: 40,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    color: '#212529',
  },
  textArea: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    fontSize: 16,
    color: '#212529',
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#0d6efd',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default DayOffScreen;
