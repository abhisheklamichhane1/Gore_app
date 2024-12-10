import { useUser } from "@/hooks/useUser";
import axios from "@/lib/axios";
import timeUtils from "@/utils/timeUtils";
import { useQuery } from "@tanstack/react-query";
import React, { useState, createContext, useContext, useEffect } from "react";

const fetchTodayEntries = async (userID, siteID, setTasks) => {
  const { data } = await axios.get(`/TimeEntry/Today/${userID}/${siteID}`);

  if (Array.isArray(data)) {
    setTasks(data);
  }
  return data;
};

const fetchPastTSDates = async (userID, siteID, setPastTSDates) => {
  const { data } = await axios.get(`/dayoff/pastdates/${siteID}/${userID}`);

  if (Array.isArray(data)) {
    setPastTSDates(data);
  }

  return data;
};

const fetchPastTSTasks = async (date, siteID, userID, setTasks) => {
  const { data } = await axios.get(`/timeentry/history/${userID}/${siteID}/${date}`);

  if (Array.isArray(data)) {
    setTasks(data);
  };

  return data;
};

// Create the context with a default value
export const TaskContext = createContext({
  tasks: null,
  isTaskLoading: false,
  viewPastTimeSheet: false,
  setViewPastTimeSheet: () => {},
  pastTSLoading: false,
  totalTime: null,
});

export function TaskProvider({ children }) {
  const { userData } = useUser();
  const [pastTSDates, setPastTSDates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [viewPastTimeSheet, setViewPastTimeSheet] = useState(false);
  const [activePastTSIndex, setActivePastTSIndex] = useState(0);
  const [totalTime, setTotalTime] = useState(null);

  // total time reset
  useEffect(() => {
    if (tasks?.length > 0) {
      const startTime = tasks[0].startTime;
      const finishTime = tasks[tasks.length - 1]?.finishTime;

      const totalTime = timeUtils.calculateTimeDifference(
        startTime,
        finishTime
      );
      setTotalTime(totalTime);
    }
  }, [tasks]);

  // Logout actions
  useEffect(() => {
    // Reset tasks, viewPastTimeSheet, and activePastTSIndex
    if (!userData) {
      setPastTSDates([]);
      setTasks([]);
      setViewPastTimeSheet(false);
      setActivePastTSIndex(0);
      setTotalTime(null);
    }
  }, [userData]);

  const {
    data,
    isLoading: isTSLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["todayEntries", userData?.userID, userData?.siteID],
    queryFn: () =>
      fetchTodayEntries(userData?.userID, userData?.siteID, setTasks),
    enabled: !viewPastTimeSheet && !!userData?.userID && !!userData?.siteID,
  });

  const { data: pastTimeSheetDates, isLoading: pastTSLoading } = useQuery({
    queryKey: ["pastTSDates", userData?.userID, userData?.siteID],
    queryFn: () =>
      fetchPastTSDates(userData?.userID, userData?.siteID, setPastTSDates),
    enabled: !!userData?.userID && !!userData?.siteID,
  });

  const { isLoading: isPastTSLoading } = useQuery({
    queryKey: ['pastTSTasks', pastTSDates[activePastTSIndex], userData?.siteID, userData?.userID],
    queryFn: () => fetchPastTSTasks(pastTSDates[activePastTSIndex], userData?.siteID, userData?.userID, setTasks),
    enabled: viewPastTimeSheet && pastTSDates[activePastTSIndex] && !!userData?.userID && !!userData?.siteID
  });

  const handlePastTSNav = (action) => {
    if (action === "prev" && activePastTSIndex > 0) {
      return setActivePastTSIndex((prev) => prev - 1);
    } else if (activePastTSIndex + 1 < pastTSDates.length) {
      return setActivePastTSIndex((prev) => prev + 1);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isTSLoading,
        isPastTSLoading,
        viewPastTimeSheet,
        setViewPastTimeSheet,
        pastTSLoading,
        pastTSDates,
        activePastTSIndex,
        handlePastTSNav,
        totalTime,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
