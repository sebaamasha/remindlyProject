import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  
  const handleLogin = async () => {
    await AsyncStorage.setItem('userToken', 'false'); // Save a mock token
    
    router.replace('/'); // Redirect to the main layout
  };
  const goToSignIn = async () => {
    await AsyncStorage.setItem('userToken', 'false'); // Save a mock token
    
    router.replace('/'); // Redirect to the main layout
  };
  return (
   
    <View style={styles.container1}>
      <View style={styles.topBackground} />
      <Image source={require('../assets/Logo.png')} style={styles.Logo} />
      <TextInput style={styles.input} placeholder="UserName" />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={goToSignIn}>
        <Text style={styles.SignIn}>Sign In</Text>
      </TouchableOpacity>
    </View>
      
    
  );
};

const styles = StyleSheet.create({
    container1: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FF9A5B',
      },
      topBackground: {
        width: '110%',
        height: '100%',
        backgroundColor: '#ffff',
        borderTopLeftRadius: 124,
        borderTopRightRadius: 124,
        position: 'absolute',
        top: '10%',
      },
      title: {
        fontSize: 24,
        marginBottom: 20,
        fontWeight: 'bold',
      },
      input: {
        width: 282,
        height: 50,
        marginBottom: 20,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#DF6316',
        borderRadius: 5,
        backgroundColor: '#fff',
      },
      button: {
        backgroundColor: '#DF6316',
        paddingVertical: 13,
        paddingHorizontal: 40,
        borderRadius: 5,
      },
      buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
      },
      SignIn: {
        color: '#DF6316',
        paddingVertical: 10,
        textDecorationLine: 'underline',
      },
      Logo: {
        width: 333,
        height: 247,
      },container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
});

export default LoginScreen;
