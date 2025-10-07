import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

const PushNotification = ({ title, message }: { title: string; message: string }) => {
 
const triggerPushNotification = async (title: string, message: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: message,
    },
    trigger: null,
  });
};
  return (
    <View style={styles.notificationContainer}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 10,
    marginBottom: 20,
    borderColor: '#FF9A5B',
    borderWidth: 3,
  },
  title: {
    fontWeight: 'bold',
    color: 'white',
  },
  message: {
    color: 'white',
  },
});

export default PushNotification;
