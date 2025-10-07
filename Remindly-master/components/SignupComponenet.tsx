import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import config from '../config';

const SignupComponent = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState(''); // New gender state
  const [address, setAddress] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false); // State for loading

  const handleRegister = async () => {
    setLoading(true); // Show loading modal
    try {
      const response = await fetch(config.SERVER_API + '/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          // Include gender in the request
          address, 
          gender, // Send the structured address
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'Registration successful!');
        onClose(); // Close the modal
      } else {
        if (data.error && (!data.err || data.err.code === undefined)) {
          Alert.alert('Error', data.error);
        } else if (data.err?.code === 11000) {
          Alert.alert('Error', 'Username is already taken. Please try another one.');
        } else {
          Alert.alert('Error', data.err?.errorResponse?.errmsg || 'Registration failed!');
        }
      }
    } catch (error) {
     
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred during registration.');
    } finally {
      setLoading(false); // Hide loading modal
    }
  };

  const handleAddressSelect = (data: any, details: any) => {
    if (details) {
      const name = data.description;
      const { lat, lng } = details.geometry.location;

      setAddress({
        name,
        lat,
        lng,
      });
    } else {
      console.warn('No details available for the selected place.');
      Alert.alert('Error', 'Unable to fetch address details.');
    }
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Sign Up</Text>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor="#aaa"
              value={username}
              onChangeText={setUsername}
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              secureTextEntry
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
            />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              <Pressable
                style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
                onPress={() => setGender('male')}>
                <Text style={styles.genderText}>Male</Text>
              </Pressable>
              <Pressable
                style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
                onPress={() => setGender('female')}>
                <Text style={styles.genderText}>Female</Text>
              </Pressable>
              <Pressable
                style={[styles.genderButton, gender === 'other' && styles.genderButtonActive]}
                onPress={() => setGender('other')}>
                <Text style={styles.genderText}>Other</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Address</Text>
            <GooglePlacesAutocomplete
              placeholder="Search your address"
              minLength={2}
              fetchDetails={true}
              onPress={handleAddressSelect}
              query={{
                key: config.GOOGLE_API,
                language: 'en',
              }}
              styles={{
                textInput: {
                  height: 40,
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  backgroundColor: '#f9f9f9',
                  marginBottom: 20,
                },
              }}
            />

            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, styles.buttonSignIn]}
                onPress={handleRegister}>
                <Text style={styles.textStyle}>Sign Up</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={onClose}>
                <Text style={styles.textStyle}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {loading && (
        <Modal transparent={true} animationType="fade" visible={loading}>
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Please wait...</Text>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
    flex: 1,
    alignItems: 'center',
  },
  buttonSignIn: {
    backgroundColor: '#4CAF50',
  },
  buttonClose: {
    backgroundColor: '#f44336',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  genderButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  genderButtonActive: {
    backgroundColor: '#4CAF50',
  },
  genderText: {
    color: '#333',
    fontWeight: 'bold',
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
});

export default SignupComponent;
