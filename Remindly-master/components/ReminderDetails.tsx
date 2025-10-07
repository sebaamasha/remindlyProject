import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import config from '@/config';
import { useLogin } from '../app/auth/LoginContext';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import date picker

type Reminder = {
  id: string;
  title: string;
  details: string;
  address: {
    name: string;
    lat: number;
    lng: number;
  };
  reminderType: 'location' | 'time';
  Time: string;
};

type PlacePrediction = {
  description: string;
  place_id: string;
};

type ReminderDetailsProps = {
  reminder: Reminder | null;
  onClose: () => void;
  onSave: (updatedReminder: Reminder) => void;
};

const ReminderDetails: React.FC<ReminderDetailsProps> = ({ reminder, onClose, onSave }) => {
  if (!reminder) return null;

  const [editableReminder, setEditableReminder] = useState(reminder);
  const [prev_address, setPrevAddress] = useState('');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const { userId, refreshReminders } = useLogin();

  const [date, setDate] = useState(new Date(editableReminder.Time || Date.now()));
  const [time, setTime] = useState(new Date(editableReminder.Time || Date.now()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
  
      // Combine selected date with existing time
      const updatedDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        time.getHours(),
        time.getMinutes()
      );
  
      handleEditChange('Time', updatedDateTime.toISOString());
    }
  };
  const onChangeTime = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
      handleEditChange('Time', selectedTime.toISOString()); // Save time in ISO format
    }
  };
  useEffect(() => {
    if (editableReminder.address?.name) {
      setPrevAddress(editableReminder.address.name);
    }
  }, [editableReminder.address]);
  const isTimeReminder = editableReminder.reminderType === 'time';

  const handleEditChange = (field: keyof Reminder, value: string) => {
    setEditableReminder((prev) => ({ ...prev, [field]: value }));
  };

  const fetchPlaces = async (text: string) => {
    setQuery(text);

    if (text.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${config.GOOGLE_API}&language=en`
      );
      const data = await response.json();

      if (data.status === 'OK') {
        setSuggestions(data.predictions);
      } else {
        console.error('Error fetching places:', data);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const handlePlaceSelect = (place: PlacePrediction) => {
    setQuery(place.description);
    setSuggestions([]);

    fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${config.GOOGLE_API}`
    )
      .then((response) => response.json())
      .then((data) => {
        const { lat, lng } = data.result.geometry.location;
        setEditableReminder((prev) => ({
          ...prev,
          address: {
            name: place.description,
            lat,
            lng,
          },
        }));
      })
      .catch((error) => {
        console.error('Error fetching place details:', error);
      });
  };

  const handleSave = async () => {
    if (!editableReminder.title || !editableReminder.details) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    try {
      const url =
        editableReminder.reminderType === 'location'
          ? `${config.SERVER_API}/location-reminders/${editableReminder.id}`
          : `${config.SERVER_API}/time-reminders/${editableReminder.id}`;

      const dataToSave = {
        ...editableReminder,
        Details: editableReminder.reminderType === 'time' ? editableReminder.details : undefined,
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        onSave(editableReminder);
        Alert.alert('Success', 'Reminder updated successfully.');
        if (editableReminder.reminderType === 'location') {
          refreshReminders();
        }
        onClose();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to update reminder.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating the reminder.');
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View
        style={[
          styles.modalContent,
        ]}
      >
        <Text style={styles.modalTitle}>Edit Reminder</Text>

        <Text style={styles.InfoTitle}>Title:</Text>
        <TextInput
          style={styles.input}
          value={editableReminder.title}
          onChangeText={(text) => handleEditChange('title', text)}
        />

        {editableReminder.reminderType === 'location' && (
          <>
            <Text style={styles.InfoTitle}>Current Address:</Text>
            <Text style={styles.currentAddress}>
              {prev_address || editableReminder.address?.name}
            </Text>

            <Text style={styles.InfoTitle}>New Address:</Text>
            <TextInput
              style={styles.input}
              placeholder="Search for a location"
              value={query}
              onChangeText={fetchPlaces}
            />
            {suggestions.length > 0 && (
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionRow}
                    onPress={() => handlePlaceSelect(item)}
                  >
                    <Text style={styles.suggestionText}>{item.description}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </>
        )}

{isTimeReminder && (
  <>
    <Text style={styles.InfoTitle}>Date:</Text>
    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.timePickerButton}>
      <Text style={styles.timePickerText}>
        {date.toLocaleDateString()}
      </Text>
    </TouchableOpacity>

    {showDatePicker && (
      <DateTimePicker
        value={date}
        mode="date"
        display={Platform.OS === 'android' ? 'default' : 'spinner'}
        onChange={onChangeDate}
      />
    )}

    <Text style={styles.InfoTitle}>Time:</Text>
    <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timePickerButton}>
      <Text style={styles.timePickerText}>
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </TouchableOpacity>

    {showTimePicker && (
      <DateTimePicker
        value={time}
        mode="time"
        display="spinner"
        onChange={onChangeTime}
      />
    )}
  </>
)}


        <Text style={styles.InfoTitle}>Details:</Text>
        <TextInput
          style={styles.input}
          value={editableReminder.details}
          onChangeText={(text) => handleEditChange('details', text)}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <FontAwesome name="save" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    width: 300,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DF6316',
  },
  InfoTitle: {
    fontWeight: 'bold',
    marginVertical: 9,
  },
  currentAddress: {
    color: '#444',
    fontSize: 16,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    fontSize: 16,
  },
  suggestionRow: {
    padding: 10,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16df27',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 10,
    position: 'absolute',
    left: 207,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#DF6316',
    fontWeight: 'bold',
  },
  timePickerButton: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  timePickerText: {
    fontSize: 16,
    color: '#444',
  },
  
});

export default ReminderDetails;
