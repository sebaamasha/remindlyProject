import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import date picker
import { useLogin } from '../app/auth/LoginContext';
import config from '@/config';

interface AddReminderModalProps {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  onSaveReminder: (reminder: any) => void;
}

const AddReminderModal: React.FC<AddReminderModalProps> = ({
  modalVisible,
  setModalVisible,
  onSaveReminder,
}) => {
  const { userId ,refreshReminders} = useLogin(); // Access userId from context
  const [reminderType, setReminderType] = useState<'location' | 'time'>('location');
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [radius, setRadius] = useState('200.00');
  const [Time, setTime] = useState('');
  const [date, setDate] = useState(new Date());
  const [details, setDetails] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isTimePicker, setIsTimePicker] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const handleSave = () => {
    if (!userId) {
      Alert.alert('Error', 'User ID is not available. Please log in again.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a reminder title.');
      return;
    }
    if (reminderType === 'location') {
      if (!address.trim() || !latitude || !longitude) {
        Alert.alert('Error', 'Please select an address.');
        return;
      }
      if (!details.trim()) {
        Alert.alert('Error', 'Please enter additional details.');
        return;
      }
    } else if (reminderType === 'time') {
      if (!Time.trim()) {
        Alert.alert('Error', 'Please select a time.');
        return;
      }
      if (!details.trim()) {
        Alert.alert('Error', 'Please enter additional details.');
        return;
      }
    }
  const timeArray = Time.split(':');
    const updatedDate = new Date(selectedDate);
    if (selectedTime) {
      updatedDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    }
    const newReminder = {
      id: Date.now().toString(),
      title,
      reminderType,
      address,
      radius,
      Time: reminderType === 'time' ? updatedDate.toISOString() : '',
      details,
      latitude,
      longitude,
    };

    onSaveReminder(newReminder);
    setModalVisible(false);
    saveReminderToDatabase(newReminder);
  };

  const handleAddressSelect = (data: any, details: any) => {
    if (details) {
      const fullAddress = data.description;
      const lat = details.geometry.location.lat;
      const lng = details.geometry.location.lng;
      setAddress(fullAddress); 
      setLatitude(lat); 
      setLongitude(lng); 
    } else {
      console.warn('No details available for the selected place.');
      Alert.alert('Error', 'Unable to fetch address details.');
    }
  };
  const saveReminderToDatabase = async (reminder: any) => {
    try {
      const url =
        reminder.reminderType === 'location'
          ? `${config.SERVER_API}/users/${userId}/location-reminders`
          : `${config.SERVER_API}/users/${userId}/time-reminders`;

      const newReminder =
        reminder.reminderType === 'location'
          ? {
              title: reminder.title,
              address: {
                name: reminder.address,
                lat: reminder.latitude,
                lng: reminder.longitude,
              },
              details: reminder.details,
            }
          : {
              title: reminder.title,
              Details: reminder.details,
              Time: reminder.Time,
            };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReminder),
      });

      const result = await response.json();
      if (response.ok) {
        const savedReminder = {
          ...newReminder,
          id: result.reminder._id, 
        };
        if(reminder.reminderType === 'location'){
          refreshReminders();
        }
       
        onSaveReminder(savedReminder);
        setModalVisible(false); 
        Alert.alert('Success', 'Reminder added successfully!');      } else {
        console.error('Failed to save reminder:', result.message || response.statusText);
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={styles.closemodal}>X</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create a New Reminder</Text>

          <Text>Reminder Title:</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} />

          <Text>Reminder Type:</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity onPress={() => setReminderType('location')}>
              <Text style={[styles.radioOption, reminderType === 'location' && styles.selectedRadio]}>
                Location-based
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setReminderType('time')}>
              <Text style={[styles.radioOption, reminderType === 'time' && styles.selectedRadio]}>
                Time-based
              </Text>
            </TouchableOpacity>
          </View>

          {reminderType === 'location' && (
            <>
              <Text>Address:</Text>
              <GooglePlacesAutocomplete
                placeholder="Search your address"
                minLength={2}
                fetchDetails={true}
                onPress={handleAddressSelect}
                query={{
                  key: 'AIzaSyAp2CByzchy61Z_OQxvuTRRwc3mUInW0RE',
                  language: 'en',
                }}
                styles={{
                  container: { flex: 0, width: '100%' },
                  textInput: styles.input,
                }}
              />
              <Text>Details:</Text>
              <TextInput
                style={[styles.input, styles.largeInput]}
                value={details}
                onChangeText={setDetails}
                multiline
              />
            </>
          )}

          {reminderType === 'time' && (
            <>
              <Text>Date:</Text>
              <TouchableOpacity onPress={() => { setShowDatePicker(true); setIsTimePicker(false); }}>
              <Text style={styles.input}>{selectedDate.toDateString()}</Text>
              </TouchableOpacity>

              <Text>Time:</Text>
              <TouchableOpacity onPress={() => { setShowDatePicker(true); setIsTimePicker(true); }}>
                <Text style={styles.input}>{selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode={isTimePicker ? 'time' : 'date'}
                  display={Platform.OS === 'android' ? 'default' : 'spinner'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      if (isTimePicker) {
                       
                        setSelectedTime(selectedDate);
                      } else {
                        setDate(selectedDate);
                      }
                    }
                  }}
                />
              )}

              <Text>Details:</Text>
              <TextInput
                style={[styles.input, styles.largeInputForTime]}
                value={details}
                onChangeText={setDetails}
                multiline
              />
            </>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Add Reminder</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  closemodal: {
    position:'relative',
    top:-12,
    left:0,
    alignSelf: 'flex-end',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DF6316',
  },
  modalTitle: {
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#DF6316',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DF6316',
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
    width: '100%',
  },
  largeInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  largeInputForTime: {
    height: 40,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 8,
    marginTop: 8,

  },
  radioOption: {
    fontSize: 16,
    color: '#888',
  },
  selectedRadio: {
    color: '#DF6316',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#DF6316',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AddReminderModal;
