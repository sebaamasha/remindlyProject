
import React, { useEffect, useState,useRef } from "react";
import { StyleSheet, View, Alert, Button, TouchableOpacity } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { useLogin } from "../app/auth/LoginContext";

import config from "@/config";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import ShowItemList from "./ShowItemList"; // Import ShowItemList component


const MapComponent = () => {
  type Reminder = {
    id: string;
    title: string;
    details: string;
    address: string;

    reminderType: 'location';

    lat: number;
    lng: number;
  };
  const [mapRegion, setMapRegion] = useState({
    latitude: 32.806482,
    longitude: 35.151898,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  type Market = {
    id: string;
    name: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  };

  const triggeredReminders = useRef(new Set<string>());
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const {userId, reminders, fetchReminders, refreshKey } = useLogin(); // Access refreshKey from context
  const [mapKey, setMapKey] = useState(0);

  const [refresh, setrefresh] = useState(false); 

  const [nearbyMarkets, setNearbyMarkets] = useState<Market[]>([])
  const [showMarkets, setShowMarkets] = useState(false);
  const [locationReminders, setLocationReminders] = useState<Reminder[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<{ lat: number; lng: number } | null>(null);
  const [lastMapUpdateLocation, setLastMapUpdateLocation] = useState<Location.LocationObject | null>(null);



   const [userAddress, setUserAddress] = useState<{ HouseLatitude: number; HouseLongitude: number } | null>(null);
   const [leftHouse, setLeftHouse] = useState(false); // New state for tracking if the user left their house
   const [showItemList, setShowItemList] = useState(false); // Control visibility of ShowItemList



  if (refresh) {
    setrefresh(false);
    fetchReminders();
  }

  useEffect(() => {
    // Fetch user's address when component mounts
    const fetchUserAddress = async () => {
      try {
        const response = await fetch(`${config.SERVER_API}/users/${userId}`);
        const data = await response.json();
        if (data.address) {
          setUserAddress({ HouseLatitude: data.address.lat, HouseLongitude: data.address.lng });
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch user data.");
      }
    };
    fetchUserAddress();
  }, [userId]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    
  
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,

            timeInterval: 5000, // Update location every 5 seconds

            distanceInterval: 10, // Update when moving 10 meters
          },
          (location) => {
            
            setUserLocation(location);
            if (lastMapUpdateLocation) {
              const distanceMoved = getDistance(
                { latitude: location.coords.latitude, longitude: location.coords.longitude },
                { latitude: lastMapUpdateLocation.coords.latitude, longitude: lastMapUpdateLocation.coords.longitude }
              );
            
              if (distanceMoved >= 100) { // Update map only when user moves 100m
                setMapRegion({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                });
                setLastMapUpdateLocation(location); // Save last updated location
              }
            } else {
              setLastMapUpdateLocation(location); // Initialize last map update location
            }

            if (userAddress) {
              const distanceToHome = getDistance(
                { latitude: location.coords.latitude, longitude: location.coords.longitude },
                { latitude: userAddress.HouseLatitude, longitude: userAddress.HouseLongitude }
              );

              // Check if user has left the house
              if (distanceToHome > 50 && !leftHouse) {
                setLeftHouse(true);
                setShowItemList(true); // Show item list modal
              } else if (distanceToHome <= 50 && leftHouse) {
                setLeftHouse(false);
                setShowItemList(false); // Hide item list modal
              }
            }
          }
        );
      } else {
        Alert.alert("Permission Denied", "Location permission is required to use this feature.");
      }
    })();
  
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };

  }, [userLocation, userAddress, leftHouse]);

  
  const handleMarketPress = (lat: number, lng: number) => {
    setSelectedMarket({ lat, lng }); 
  };

  const fetchNearbyMarkets = async () => {
    if (!userLocation) {
      Alert.alert("Error", "User location not found");
      return;
    }

   
    const { latitude, longitude } = userLocation.coords;
    

    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=2000&type=store&key=${config.GOOGLE_API}`;


    try {
      const response = await fetch(placesUrl);
      const data = await response.json();

      if (data.results) {
        setNearbyMarkets(data.results);

        setShowMarkets(!showMarkets);
      } else {
        Alert.alert("No Markets Found", "Try again later.");

      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch nearby markets");
    }
  };

  const isWithinRadius = (reminderLat: number, reminderLong: number) => {
    if (userLocation) {
      const distance = getDistance(
        { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude },
        { latitude: reminderLat, longitude: reminderLong }
      );
      return distance <= 200;
    }
    return false;
  };

  const getDistance = (location1: { latitude: number; longitude: number }, location2: { latitude: number; longitude: number }) => {
    const toRadians = (degree: number) => degree * (Math.PI / 180);
    const lat1 = location1.latitude;
    const lon1 = location1.longitude;
    const lat2 = location2.latitude;
    const lon2 = location2.longitude;

    const R = 6371; 
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000;

    return distance;
  };

  useEffect(() => {
   
    reminders.forEach((reminder) => {
      if (isWithinRadius(reminder.lat, reminder.lng) && !triggeredReminders.current.has(reminder.title)) {

        Alert.alert('Reminder', `You are near the reminder ${reminder.title}\nremember to ${reminder.details}`);
        triggeredReminders.current.add(reminder.title);     
      }
    });
  }, [userLocation, reminders]);


  const recenterToHouse = () => {
    if (userAddress && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userAddress.HouseLatitude,
          longitude: userAddress.HouseLongitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    } else {
      Alert.alert("No Address", "User address is not available.");
    }
  };
    
  // Fetch reminders when refreshKey changes
  useEffect(() => {
    setMapKey(mapKey+1);
    setrefresh(true);
    fetchReminders();
  }, [fetchReminders, refreshKey]); // Triggered when refreshKey changes
  
  
  const mapRef = useRef<MapView | null>(null);

  const recenterMap = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  
  return (
     <View style={styles.MapContainer}>

      {/* ✅ Added ref={mapRef} to MapView */}
      <MapView ref={mapRef} style={styles.map} region={mapRegion}>
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            pinColor="red"
            title="Your Location"
          />
        )}


        {/* Render reminders */}
        {reminders.map((reminder, index) => (
          reminder.lat !== undefined &&
          reminder.lng !== undefined && (
            <React.Fragment key={reminder.id || index}>
              <Marker
                coordinate={{ latitude: reminder.lat, longitude: reminder.lng }}
                pinColor="blue"
                title={reminder.title}
              />
              <Circle
                center={{ latitude: reminder.lat, longitude: reminder.lng }}
                radius={200}
                strokeWidth={2}
                strokeColor="rgba(76, 76, 251, 0.5)"
                fillColor="rgba(101, 165, 255, 0.2)"
              />
            </React.Fragment>
          )
        ))}

        {/* ✅ Display Nearby Markets */}
        {showMarkets &&
          nearbyMarkets.map((market, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: market.geometry.location.lat,
                longitude: market.geometry.location.lng,
              }}
              pinColor="green"
              title={market.name}
              onPress={() => handleMarketPress(market.geometry.location.lat, market.geometry.location.lng)}
            />
            
          ))
          }

          {userAddress && (
        <React.Fragment key="userHome">
        <Marker
          coordinate={{
            latitude: userAddress.HouseLatitude,
            longitude: userAddress.HouseLongitude,
          }}
          title="Home"
        >
          <FontAwesome6 name="house" size={25} color="black" />
        </Marker>
        <Circle
          center={{
            latitude: userAddress.HouseLatitude,
            longitude: userAddress.HouseLongitude,
          }}
          radius={50}
          strokeWidth={2}
          strokeColor="rgba(251, 76, 76, 0.5)"
          fillColor="rgba(255, 106, 101, 0.2)"
        />
      </React.Fragment>
      
          )}

      </MapView>
        {showItemList && (
        <ShowItemList
          visible={showItemList}
          onClose={() => setShowItemList(false)} // Close the modal when clicked
        />
      )}

      <FontAwesome6 name="location-crosshairs" size={24} color="black" />

      <TouchableOpacity onPress={recenterMap} style={styles.recenterButtonContainer}>
      <FontAwesome6 name="location-crosshairs" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={fetchNearbyMarkets} style={styles.marketButtonContainer}>
        <FontAwesome6 name="store" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity onPress={recenterToHouse} style={styles.houseButtonContainer}>
      <FontAwesome6 name="house" size={24} color="black" />
      </TouchableOpacity>


    </View>
  );
};

export default MapComponent;
const styles = StyleSheet.create({
  MapContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    bottom:"10%",
    width: "100%",
    height: "80%",
    borderRadius: 10,
  },
  recenterButtonContainer: {
    position: "absolute",
    top: 20, // Adjusted for top-left placement
    left: 20, // Adjusted for top-left placement
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    elevation: 5, // Android shadow effect
    shadowColor: "#000", // iOS shadow effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addButton: {
    position: "absolute",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 50,
    elevation: 5,
  },
  marketButtonContainer: {
    position: "absolute",
    top: 80, // Below the "My Location" button
    left: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    elevation: 5, // Android shadow effect
    shadowColor: "#000", // iOS shadow effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  houseButtonContainer: {
    position: "absolute",
    top: 140,
    left: 20,  // Adjust positioning to avoid overlap with recenter button
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  
});