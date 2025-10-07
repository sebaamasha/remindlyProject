import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { Entypo, Feather } from '@expo/vector-icons';
import { useLogin } from '../auth/LoginContext';
import Header from '../../components/Header';
import config from '../../config';

export default function ProfileScreen() {
  const { userId } = useLogin();
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    gender: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${config.SERVER_API}/users/${userId}`);
        const data = await response.json();

        if (response.ok) {
          setUserData({
            firstName: data.username || '',
            lastName: data.lastName || '',
            email: data.email || '',
            address: data.address?.name || '',
            gender: data.gender || '',
          });
        } else {
          Alert.alert('Error', data.error || 'Failed to fetch user data.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'An error occurred while fetching user data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text>Loading your profile...</Text>
      </View>
    );
  }

  // Default profile images based on gender
  // שימוש בתמונות אווטאר לפי מין המשתמש
  const profileImageUri =
  userData.gender === 'male'
    ? `https://api.dicebear.com/6.x/adventurer/png?seed=${userData.firstName}`
    : userData.gender === 'female'
    ? `https://api.dicebear.com/6.x/adventurer/png?seed=${userData.firstName}`
    : `https://api.dicebear.com/6.x/adventurer/png?seed=neutral`;

    // שימוש ב-Image של React Native
    <Image
      source={{ uri: profileImageUri }}
      style={styles.profileImage}
    />




  return (
    <>
    <View style={styles.headerStyle}> 
        <Header />
      </View>

    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Entypo name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
        <Text style={styles.profileName}>{`${userData.firstName}`}</Text>
        <Text style={styles.profileLocation}>{userData.address}</Text>
      </View>

      {/* Form Section */}
      <View style={styles.formCard}>
        <Text style={styles.label}>User Name</Text>
        <TextInput style={styles.input} value={userData.firstName} onChangeText={(text) => setUserData({ ...userData, firstName: text })} />

        <Text style={styles.label}>Address</Text>
        <TextInput style={styles.input} value={userData.address} onChangeText={(text) => setUserData({ ...userData, address: text })} />
      </View>
    </View>
  </>
  );
}

const styles = StyleSheet.create({
  headerStyle:{
    width : '100%', 
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    bottom : 20
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ddd',
    marginBottom: 10,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  profileLocation: {
    fontSize: 16,
    color: '#777',
    marginTop: 5,
  },
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    bottom : 20

  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

