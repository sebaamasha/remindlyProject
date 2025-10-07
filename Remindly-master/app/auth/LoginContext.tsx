import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import config from "@/config";
import { Alert } from "react-native";

interface Reminder {
  id: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
  details: string; // Ensure consistent naming
}

interface LoginContextType {
  isLoginComplete: boolean;
  setIsLoginComplete: (isComplete: boolean) => void;
  userId: string | null;
  setUserId: (id: string | null) => void;
  reminders: Reminder[];
  fetchReminders: () => Promise<void>;
  setReminders: (reminders: Reminder[]) => void;
  reminder: Reminder | null;
  setReminder: (reminder: Reminder | null) => void;
  refreshKey: number; 
  refreshReminders: () => void;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export const useLogin = (): LoginContextType => {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error("useLogin must be used within a LoginProvider");
  }
  return context;
};

interface LoginProviderProps {
  children: ReactNode;
}

export const LoginProvider: React.FC<LoginProviderProps> = ({ children }) => {
  const [isLoginComplete, setIsLoginComplete] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminder, setReminder] = useState<Reminder | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshReminders = () => setRefreshKey((prev) => prev + 1);

  const fetchReminders = useCallback(async () => {
    try {
      const response = await fetch(config.SERVER_API + '/users/' + userId + '/reminders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
    if (response.ok) {
      const locationReminders = data.reminders.locationReminders || [];
      const transformedReminders = locationReminders.map((reminder: any) => ({
        id: reminder._id.toString(),  
        title: reminder.title,
        name: reminder.address.name,
        lat: parseFloat(reminder.address.lat),  // Ensure latitude is a number
        lng: parseFloat(reminder.address.lng), 
        address: reminder.address.name || `${reminder.address.lat}, ${reminder.address.lng}`,
        details: reminder.details,
      }));
      setReminders(transformedReminders);

    } else {
      Alert.alert('Error', data.message || 'Failed to fetch reminders.');
    }
  } catch (error) {
    console.error('Error fetching reminders:', error);
    Alert.alert('Error', 'An error occurred while fetching reminders.');
  }
}, [userId]);

  useEffect(() => {
    if (userId) {
      fetchReminders();
    }
  }, [userId, fetchReminders]);

  return (
    <LoginContext.Provider
      value={{
        isLoginComplete,
        setIsLoginComplete,
        userId,
        setUserId,
        reminders,
        fetchReminders,
        setReminders,
        reminder,
        setReminder,
        refreshKey,
        refreshReminders
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export default LoginContext;