import React from 'react';
import { View, Text, StyleSheet, Image, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from '@/lib/axios';
import { router } from 'expo-router';
import { useUser } from '@/hooks/useUser';

// Define the Zod schema dynamically based on questions
const createDynamicSchema = (questions) => {
  const schemaFields = questions.reduce((acc, question) => {
    if (question.mandatory) {
      acc[`${question.sequenceNo}`] = z.string().min(1, { 
        message: `${question.questionText} is required` 
      });
    }
    return acc;
  }, {});

  return z.object(schemaFields);
};

const fetchDayStartQuestions = async () => {
  const { data } = await axios.get(`/DayStartQuestions`);
  return data;
};

const answerDayStartQuestions = async (answers) => {
  const { data } = await axios.post(`/DayStartQuestions`, answers);
  return data;
};

export default function DayStartScreen() {
  const { userData } = useUser();
  const { data: questions, isLoading, isError } = useQuery({
    queryKey: ['dayStartQuestions'],
    queryFn: fetchDayStartQuestions,
  });
  const answerDSQuestionMutation = useMutation({
    mutationFn: answerDayStartQuestions,
    onSuccess: () => {
      console.log("success!!!");

      router.replace("/mainscreen");
    }
  });

  // Dynamically create schema when questions are loaded
  const schema = questions 
    ? createDynamicSchema(questions) 
    : z.object({});

  const { 
    control, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit'
  });

  const onSubmit = (data) => {
    const newData = {
      siteID: userData?.siteID,
      userID: userData?.userID,
      answers: {...data}
    };

    answerDSQuestionMutation.mutate(newData);
    
    // Transform form data back to your original format
    // const transformedAnswers = Object.keys(data).reduce((acc, key) => {
    //   const sequenceNo = key.split('_')[1];
    //   acc[sequenceNo] = data[key];
    //   return acc;
    // }, {});
    
    // Proceed with your submission logic
    // Alert.alert('Form Submitted', JSON.stringify(transformedAnswers));
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image
          source={require('../assets/images/safety.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.message}>
          Please answer the following questions before starting your day.
        </Text>

        {questions?.map(question => (
          <View key={question.sequenceNo}>
            <View style={[styles.questionContainer, {marginBottom: 10}]}>
              <View style={styles.questionTextContainer}>
                <Text style={styles.question}>
                  {question.questionText}
                  {question.mandatory && <Text style={styles.mandatoryIndicator}>*</Text>}
                </Text>
              </View>

              <Controller
                control={control}
                name={`${question.sequenceNo}`}
                defaultValue=""
                rules={{ required: question.mandatory }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={value}
                      onValueChange={(itemValue) => onChange(itemValue)}
                      style={styles.picker}
                      mode="dropdown"
                    >
                      <Picker.Item key="placeholder" label="Select" value="" />
                      {question.dropdownValues.map(dropValue => (
                        <Picker.Item 
                          key={dropValue} 
                          label={dropValue} 
                          value={dropValue} 
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              />
            </View>

            {errors[`${question.sequenceNo}`] && (
              <Text style={styles.errorText}>
                {errors[`${question.sequenceNo}`].message}
              </Text>
            )}
          </View>
        ))}

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f4f4f4',
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 5,
  },
  message: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: '600',
    lineHeight: 25,
  },
  questionContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 10,
    width: '100%',
    flexDirection: 'row',  // Align question and picker in a row
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  question: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
    lineHeight: 22,
    flex: 1,  // Allow question text to use remaining space
    paddingRight: 10,
  },
  pickerWrapper: {
    width: 130,  // Fixed width to align neatly on the right
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    color: '#333',
  },
  button: {
    marginTop: 30,
    width: '100%',
    backgroundColor: '#1abc9c',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1abc9c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mandatoryIndicator: {
    color: 'red',
    marginLeft: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
  },
  questionTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});