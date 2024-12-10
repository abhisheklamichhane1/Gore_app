import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "../lib/axios";
import { useRouter } from "expo-router";
import { storeData, getStorageData } from "../asyncStorage";
import { useUser } from "@/hooks/useUser";

// Validation schema
const loginSchema = z.object({
  userName: z.string().min(1, { message: "Username is required" }),
  pin: z.string().regex(/^\d{4}$/, { message: "PIN must be 4 digits" }),
  siteID: z.string(),
});

// Login API function
const loginWithPin = async (data) => {
  const response = await axios.post("/auth/login", data);
  return response.data;
};

export default function LoginScreen() {
  const { userData, setUserData, isLoading } = useUser();
  const [showSiteIDModal, setShowSiteIDModal] = useState(false);
  // const [userData, setUserData] = useState(null);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { userName: "", pin: "", siteID: "" },
  });

  // Prefill form data with stored user data
  useEffect(() => {
    if (userData) {
      setValue("siteID", userData.siteID || "");
      setValue("userName", userData.userName || "");
    }
  }, [userData, setValue]);

  const handleNavigation = async (userName) => {
    try {
      const lastLogin = await getStorageData("lastLogin"); // Fetch the stored date
      const lastLoginObj = lastLogin ? JSON.parse(lastLogin) : {};
      
      const today = new Date().toLocaleDateString("en-AU"); // Today's date in YYYY-MM-DD format
      const uniqueIdentifier = `${userName}_${today}`;

      if (lastLoginObj.hasOwnProperty(uniqueIdentifier) && lastLoginObj[uniqueIdentifier] === today) {
        router.replace("/mainscreen"); // Navigate to the main screen
      } else {
        const newLoginObj = {...lastLoginObj, [uniqueIdentifier]: today}

        await storeData("lastLogin", JSON.stringify(newLoginObj)); // Update storage with today's date
        router.replace("/day-start"); // Navigate to the Day Start screen
      }
    } catch (error) {
      console.error("Error in handleNavigation:", error);
      Alert.alert("Navigation Error", "An error occurred while navigating.");
    }
  };

  const loginMutation = useMutation({
    mutationFn: loginWithPin,
    onSuccess: async (loginData) => {
      try {
        const {
          siteID,
          userName,
          userID,
          displayName,
          siteName,
          timeEntryType,
        } = loginData;

        await storeData(
          "userData",
          JSON.stringify({
            siteID,
            userName,
            userID,
            displayName,
            siteName,
            timeEntryType,
          })
        );
        setUserData({
          siteID,
          userName,
          userID,
          displayName,
          siteName,
          timeEntryType,
        });

        Alert.alert("Login Successful", "Welcome!");

        handleNavigation(userName); // Handle screen navigation based on timesheet logic
      } catch (error) {
        console.log(error);
        Alert.alert("Error", "Failed to save user data locally.");
      }
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || "An unexpected error occurred";
      console.log(error);
      Alert.alert("Login Failed", errorMessage);
    },
  });

  const handleLogin = (data) => {
    setValue("pin", ""); // Clear PIN after submission
    loginMutation.mutate(data);
  };

  const handleSiteIDChange = (enteredSiteID) => {
    setValue("siteID", enteredSiteID);
    if (enteredSiteID.length === 50) {
      setShowSiteIDModal(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Login</Text>
      </View> */}

      <Text style={styles.header}>Gem Times</Text>
      <Image
        source={require("../assets/images/gorelogo.png")}
        style={styles.logo}
      />

      <View style={styles.siteIDContainer}>
        <Text style={styles.siteIDLabel}>Site ID:</Text>
        <Text style={styles.siteIDText}>
          {userData?.siteID || getValues().siteID || "Not Set"}
        </Text>
        <TouchableOpacity
          onPress={() => setShowSiteIDModal(true)}
          style={styles.hamburgerIcon}
        >
          <Ionicons name="menu" size={24} color="#16a085" />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={showSiteIDModal}
        onRequestClose={() => setShowSiteIDModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Site ID</Text>
            <Controller
              name="siteID"
              control={control}
              render={({ field: { value } }) => (
                <TextInput
                  placeholder="Enter Site ID"
                  value={value}
                  onChangeText={handleSiteIDChange}
                  style={styles.input}
                />
              )}
            />
            {errors.siteID && (
              <Text style={styles.errorText}>{errors.siteID.message}</Text>
            )}
            <TouchableOpacity
              onPress={() => setShowSiteIDModal(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Controller
        name="userName"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, styles.usernameInput]}
            placeholder="Enter Username"
            value={value}
            onChangeText={onChange}
            placeholderTextColor="#7f8c8d"
          />
        )}
      />
      {errors.userName && (
        <Text style={styles.errorText}>{errors.userName.message}</Text>
      )}

      <Controller
        name="pin"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, styles.pinInput]}
            placeholder="Enter 4-digit PIN"
            value={value}
            onChangeText={(text) => {
              onChange(text);
              if (text.length === 4) {
                handleSubmit(handleLogin)();
              }
            }}
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
            placeholderTextColor="#7f8c8d"
          />
        )}
      />
      {errors.pin && <Text style={styles.errorText}>{errors.pin.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  headerContainer: {
    position: "absolute", // Ensures it stays at the top
    top: 0, // Places it at the top edge
    width: "100%", // Spans the full width of the screen
    paddingVertical: 20,
    backgroundColor: "#2c3e50",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4, // Shadow effect for Android
    zIndex: 10, // Ensures it sits above other components
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 40,
    resizeMode: "contain",
  },
  siteIDContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 20,
    right: 20,
  },
  siteIDLabel: {
    fontSize: 18,
    color: "#34495e",
  },
  siteIDText: {
    fontSize: 18,
    color: "#16a085",
    fontWeight: "500",
  },
  hamburgerIcon: {
    marginLeft: 10,
  },
  input: {
    width: "90%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#bdc3c7",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    fontSize: 18,
    marginVertical: 10,
    color: "#2c3e50",
  },
  usernameInput: {
    fontSize: 22,
    textAlign: "center",
  },
  pinInput: {
    fontSize: 22,
    textAlign: "center",
    letterSpacing: 4,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    marginTop: -8,
    marginBottom: 10,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 10,
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#16a085",
    borderRadius: 10,
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
});
