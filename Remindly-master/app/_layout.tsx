import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import {  StyleSheet} from 'react-native';
import 'react-native-reanimated';
import { LoginProvider, useLogin } from "./auth/LoginContext"; // Import LoginContext

import { useColorScheme } from '../hooks/useColorScheme';
import Login from '@/components/LoginComponent';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

console.log(uuidv4()); // Generates a UUID

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const ColorScheme = useColorScheme();
  const router = useRouter();
  
  // Move useLogin hook after LoginProvider
  return (
    <LoginProvider>
      <LayoutContent colorScheme={ColorScheme} />
      </LoginProvider>
    
  );
}

const LayoutContent = ({ colorScheme }: { colorScheme: any }) => {
  const { isLoginComplete, setIsLoginComplete } = useLogin(); // Now useLogin works inside the LoginProvider
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null; 
  }

  if (!isLoginComplete) {
    return (
      <Login></Login>
    );
  }

  return ( 
   
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

     {/* <Stack.Screen name="profile" options={{ title: 'profile' }} />
        <Stack.Screen name="+not-found" /> */}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    
  );
};

const styles = StyleSheet.create({
  
});
