import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Modal from "react-native-modal";
import { router } from "expo-router";
import { useUser } from "@/hooks/useUser";

import DiscardTimesheetModal from "./DiscardModal";
import { useComments } from "@/hooks/useComments";

function DropdownMenu({ viewPastTimeSheet, setViewPastTimeSheet }) {
  const { clearUserData } = useUser();
  const { updateComments } = useComments();
  const [isModalVisible, setModalVisible] = useState(false);
  const [discardModalVisible, setDiscardModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible((prev) => !prev);
  };

  const togglePastTimeSheets = () => {
    setViewPastTimeSheet((prev) => !prev);
    toggleModal();
  };

  const handleLogout = async () => {
    updateComments("");
    await clearUserData();
    router.replace("/login");
  };

  return (
    <>
      {/* Menu Button */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleModal}>
        <Icon name="menu" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal for Menu Options */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal} // Close when clicking outside
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0.5}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.option}
            onPress={togglePastTimeSheets}
          >
            <Text style={styles.optionText}>
              {viewPastTimeSheet ? "Active Timesheet" : "Past Timesheets"}
            </Text>
          </TouchableOpacity>

          {!viewPastTimeSheet &&           
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                setModalVisible(false);
                setDiscardModalVisible(true);
              }}
            >
              <Text style={styles.optionText}>Discard Timesheet</Text>
            </TouchableOpacity>
          }

          <TouchableOpacity style={styles.option} onPress={handleLogout}>
            <Text style={styles.optionText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <DiscardTimesheetModal
        isVisible={discardModalVisible}
        onClose={() => setDiscardModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    position: "absolute",
    top: 20, // Adjust for status bar
    right: 20,
    backgroundColor: "#6200ee",
    borderRadius: 50,
    padding: 10,
    elevation: 3,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: 200,
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    zIndex: 9999,
    backgroundColor: "#efefef",
  },
});

export default DropdownMenu;
