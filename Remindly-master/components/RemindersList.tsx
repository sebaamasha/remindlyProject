import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLogin } from '../app/auth/LoginContext';
import ShowReminder from './ShowReminder'; 
import config from '@/config';

type Reminder = {
  id: string;
  title: string;
  details: string;
  address:{
    name : string, 
    lat: number;
  lng: number;
  } 
  reminderType: 'location' | 'time';
  Time: string;
 
};

const RemindersList: React.FC = () => {
  const { userId ,refreshReminders } = useLogin();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'location' | 'time'>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  const fetchReminders = useCallback(async () => {
    try {
      const response = await fetch(`${config.SERVER_API}/users/${userId}/reminders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (response.ok) {
        const { locationReminders, timeReminders } = data.reminders || {};

        const transformedLocationReminders = (locationReminders || []).map((reminder: any) => ({
          id: reminder._id?.toString() || '',
          title: reminder.title,
          address :{
            name : reminder.address.name ,
            lat : reminder.address.lat,
            lng : reminder.address.lng,
          } ,
          reminderType: 'location',
          details: reminder.details || reminder.Details,
        }));

        const transformedTimeReminders = (timeReminders || []).map((reminder: any) => ({
          id: reminder._id?.toString() || '',
          title: reminder.title,
          Time: new Date(reminder.Time).toISOString(),
          reminderType: 'time',
          details: reminder.details || reminder.Details,
        }));

        setReminders([...transformedLocationReminders, ...transformedTimeReminders]);

        // if (transformedLocationReminders.length === 0 && transformedTimeReminders.length === 0) {
        //   Alert.alert('No Reminders Found', 'You have no reminders at the moment.');
        // }
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch reminders.');
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
      Alert.alert('Error', 'An error occurred while fetching reminders.');
    }
  }, [userId]);
 
 
  // useEffect(() => {
  //   fetchReminders();
  // }, [fetchReminders]);
   useEffect(() => {
     fetchReminders();
 
     const interval = setInterval(() => {
       fetchReminders(); 
       
     }, 5000); 
 
     return () => clearInterval(interval);
   }, [fetchReminders]);
 

  const filteredReminders = reminders.filter(
    (reminder) => filterType === 'all' || reminder.reminderType === filterType
  );

  const handleReminderClick = (reminderId: string) => {
    const selectedReminder = reminders.find((reminder) => reminder.id === reminderId);
    if (selectedReminder) {
      setSelectedReminder(selectedReminder); 
    }
  };

  const handleCloseModal = () => {
    setSelectedReminder(null);
  };

  const handleFilterSelect = (type: 'all' | 'location' | 'time') => {
    setFilterType(type);
    setShowFilter(false);  
  };

  const handleSaveUpdatedReminder = (updatedReminder: Reminder) => {
    setReminders((prevReminders) =>
      prevReminders.map((reminder) =>
        reminder.id === updatedReminder.id ? updatedReminder : reminder
      )
    );
    setSelectedReminder(null); 
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setShowFilter(!showFilter)} style={styles.filterIcon}>
        <FontAwesome name="filter" size={24} color='#333' />
      </TouchableOpacity>

      <Text style={styles.activeFilterText}>
        Active Filter: {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
      </Text>

      {showFilter && (
        <View style={styles.filterBox}>
          <TouchableOpacity onPress={() => handleFilterSelect('all')}>
            <Text style={[styles.filterText, filterType === 'all' && styles.activeFilter]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleFilterSelect('location')}>
            <Text style={[styles.filterText, filterType === 'location' && styles.activeFilter]}>Location</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleFilterSelect('time')}>
            <Text style={[styles.filterText, filterType === 'time' && styles.activeFilter]}>Time</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.reminderList}>
        {filteredReminders.map((reminder) => (
          <TouchableOpacity key={reminder.id} onPress={() => handleReminderClick(reminder.id)}>
            <Text style={styles.reminderItem}>{reminder.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={!!selectedReminder}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <ShowReminder
            reminder={selectedReminder}
            onClose={handleCloseModal}
            onSave={handleSaveUpdatedReminder}
            onDelete={(id) => {
              setReminders(reminders.filter((reminder) => reminder.id !== id)); 
              handleCloseModal();
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  reminderList: {
    marginTop: 10,
  },
  reminderItem: {
    fontSize: 18,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterIcon: {
    position: 'absolute', 
    top: 0, 
    left: 10,
    backgroundColor: '#eee',
    padding: 5,
    borderRadius: 5,
    zIndex: 10,
  },
  activeFilterText: {
    fontSize: 18,
    marginTop: -18,
    color: '#333',
    fontWeight: 'bold',
    left: 30,
  },
  filterBox: {
    position: 'absolute',  
    left: 35,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    zIndex: 10,
    top: 32,
  },
  filterText: {
    fontSize: 16,
    paddingVertical: 5,
  },
  activeFilter: {
    fontWeight: 'bold',
    color: '#DF6316',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default RemindersList;
