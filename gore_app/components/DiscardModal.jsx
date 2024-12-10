import { queryClient } from "@/app/_layout";
import { useUser } from "@/hooks/useUser";
import axios from "@/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import { z } from "zod";

const pinSchema = z.object({
  pin: z.string().length(4, "PIN must be exactly 4 digits"),
});

const discardTimesheet = async (data) => {
  const response = await axios.delete("/TimeEntry/Discard", {
    data,
  });
  return response;
};

const DiscardTimesheetModal = ({ isVisible, onClose }) => {
  const { userData } = useUser();
  const [step, setStep] = useState("confirm"); // 'confirm' or 'pin'

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: "" },
  });

  const discardTSMutation = useMutation({
    mutationFn: discardTimesheet,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todayEntries", userData?.userID, userData?.siteID],
      });
      onClose();
    },
    onError: (err) => {
      onClose();
      console.log(err);
    },
  });

  const handleYes = () => {
    setStep("pin");
  };

  const handleClose = () => {
    setStep("confirm");
    onClose();
  };

  const onSubmit = (data) => {
    const discardData = {
      siteID: userData?.siteID,
      userName: userData?.userName,
      pin: data.pin,
    };

    discardTSMutation.mutate(discardData);
    reset();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      style={styles.modal}
    >
      <View style={styles.container}>
        {step === "confirm" ? (
          <>
            <Text style={styles.title}>
              Are you sure you want to discard the timesheet?
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.noButton]}
                onPress={handleClose}
              >
                <Text style={styles.noText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.yesButton]}
                onPress={handleYes}
              >
                <Text style={styles.yesText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>Enter PIN</Text>

            <Controller
              control={control}
              name="pin"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.pin && styles.errorInput]}
                  placeholder="Enter your PIN"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  secureTextEntry
                />
              )}
            />
            {errors.pin && (
              <Text style={styles.errorText}>{errors.pin.message}</Text>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.yesButton]}
                onPress={handleSubmit(onSubmit)}
              >
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.noButton]}
                onPress={handleClose}
              >
                <Text style={styles.noText}>No</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    width: "80%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    marginTop: 10,
  },
  button: {
    textAlign: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  noButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  noText: {
    color: "#333",
  },
  yesButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#ff5252",
  },
  yesText: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    marginBottom: 20,
    textAlign: "center",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#4caf50",
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default DiscardTimesheetModal;
