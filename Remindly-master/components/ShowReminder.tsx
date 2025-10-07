import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import ReminderDetails from './ReminderDetails'; 
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import config from '@/config';
import { useLogin } from '@/app/auth/LoginContext';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

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

type ShowReminderProps = {
  reminder: Reminder | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onSave: (updatedReminder: Reminder) => void;
};

const ShowReminder: React.FC<ShowReminderProps> = ({ reminder, onClose, onDelete, onSave }) => {
  const [isEditing, setIsEditing] = useState(false); 
   const { userId ,refreshReminders} = useLogin(); 


  if (!reminder) {
    return null;
  }

  const handleEdit = () => {
    setIsEditing(true); 
  };

  const handleCloseEdit = () => {
    setIsEditing(false); 
  };
  const handleNavigateToWaze = () => {
    if (!reminder?.address) {
      Alert.alert('Error', 'No address found for this reminder');
      return;
    }
  
    const { lat, lng } = reminder.address;
    const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  
    Linking.openURL(wazeUrl).catch((err) => {
      console.error('Failed to open Waze:', err);
      Alert.alert('Error', 'Unable to open Waze. Please try again.');
    });
  };
  
  const modalHeight = reminder.reminderType === 'time' ? 300 : 340; 
  const deleteReminder = async (id: string, reminder: Reminder) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this reminder?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            const url =
              reminder.reminderType === 'location'
                ? `${config.SERVER_API}/location-reminders/${id}`
                : `${config.SERVER_API}/time-reminders/${id}`;
  
            try {
              const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
  
              if (response.ok) {
                Alert.alert('Success', 'Reminder deleted successfully');
                if(reminder.reminderType === 'location')
                  refreshReminders();

                onDelete(id);
              } else {
                console.error('Failed to delete reminder');
              }
            } catch (error) {
              console.error('Error deleting reminder:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  

  return (
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, { height: modalHeight }]}>
        <Text style={styles.modalTitle}>Reminder Details</Text>
        
        {isEditing ? (
          <ReminderDetails
            reminder={reminder}
            onClose={handleCloseEdit} 
            onSave={onSave} 
          />
        ) : (
          <>
            <Text style={styles.InfoTitle}>Name:</Text>
            <Text>{reminder.title}</Text>

            {reminder.reminderType === 'location' && (
              <>
                <Text style={styles.InfoTitle}>Address:</Text>
                <Text>{reminder.address.name}</Text>
              </>
            )}

           {reminder.reminderType === 'time' && (
              <>
                 <Text style={styles.InfoTitle}>Date:                 Time:</Text>
                 <View style={styles.dateTimeContainer}>
                    <Text>{new Date(reminder.Time).toLocaleDateString('en-GB')}</Text>
                    <Text style={styles.timeText}>{new Date(reminder.Time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
                 </View>            
              </>
            )}


            <Text style={styles.InfoTitle}>Details:</Text>
            <Text>{reminder.details}</Text>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={onClose} style={styles.closeButtonContainer}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
              {reminder.reminderType === 'location' && (
              <TouchableOpacity onPress={handleNavigateToWaze} style={styles.wazeButton}>
              <FontAwesome5 name="waze" size={24} color="black" />
              </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                <MaterialIcons name="edit" size={24} color="black" />
              </TouchableOpacity>
               
              <TouchableOpacity onPress={() => deleteReminder(reminder.id, reminder)} style={styles.deleteButton}>
                <FontAwesome name="trash" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: 300,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DF6316',
    textAlign: 'center',
    position: 'absolute',
    top: 25,
    left: 75,
  },
  InfoTitle: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    top:22,
  },
  closeButtonContainer: {
    padding: 10,
    backgroundColor: '#DF6316',
    borderRadius: 5,
  },
  closeButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    position:'absolute',
    padding: 10,
    borderRadius: 5,
    left: 190,
  },
  wazeButton: {
    position:'absolute',
    padding: 10,
    borderRadius: 5,
    left: 150,
  },
  deleteButton: {
    padding: 10,
    borderRadius: 5,
    left:10,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    position:'absolute',
    left: 102, 
  },
});

export default ShowReminder;
