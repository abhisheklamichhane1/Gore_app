import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorageData, storeData } from '@/asyncStorage';

// Create the context with a default value
export const UserContext = createContext({
  userData: null,
  setUserData: async () => {},
  clearUserData: async () => {},
  isLoading: true,
});

// Provider component
export function UserProvider({ children }) {
  const [userData, setUserDataState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from AsyncStorage on initial render
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const jsonValue = await getStorageData('userData');
        if (jsonValue != null) {
          const parsedData = JSON.parse(jsonValue);
          setUserDataState(parsedData);
        }
      } catch (error) {
        console.error('Error loading user data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Method to set user data and store in AsyncStorage
  const setUserData = async (data) => {
    try {
      // Save to state
      setUserDataState(data);
      
      // Save to AsyncStorage
      await storeData('userData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user data', error);
    }
  };

  // Method to clear user data from state and AsyncStorage
  const clearUserData = async () => {
    try {
      // Clear from state
      setUserDataState(null);
      
      // Remove from AsyncStorage
      await AsyncStorage.removeItem('userData');
    } catch (error) {
      console.error('Error clearing user data', error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      userData, 
      setUserData, 
      clearUserData,
      isLoading 
    }}>
      {children}
    </UserContext.Provider>
  );
}