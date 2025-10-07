import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

const SERVER_URL = 'http://localhost:8080'; // Replace with your server's URL

const App = () => {
  // Explicitly type `currentLocation` to allow `null` and `Location.LocationObjectCoords`
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObjectCoords | null>(null);

  useEffect(() => {
    (async () => {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      // Get the current location
      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords); // No type error now

      // Send location to the server
      checkProximity(location.coords);
    })();
  }, []);

  const checkProximity = async (coords: Location.LocationObjectCoords) => {
    try {
      const response = await fetch(`${SERVER_URL}/check-proximity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      });

      const data = await response.json();
      if (data.nearby) {
        data.locations.forEach((location: { name: string }) => {
          Alert.alert('Nearby Location', `You are near ${location.name}.`);
        });
      } 
    } catch (error) {
      console.error('Error checking proximity:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Proximity Checker</Text>
      {currentLocation ? (
        <Text>
          Current Location: {currentLocation.latitude}, {currentLocation.longitude}
        </Text>
      ) : (
        <Text>Loading location...</Text>
      )}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
