import { Text ,View,StyleSheet} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';


interface ReminderCardProps {
  CardName: string; // Define the expected type for CardName
}

export function ReminderCard({CardName} : ReminderCardProps) {
  return (
     <View style={styles.container}>
       <Text style={styles.text}>{CardName}</Text>
       <Ionicons name="checkmark-circle" size={32} color="green" />
       
     </View>
   );
 }
 
 const styles = StyleSheet.create({
   container: {
     flex: 1,
     backgroundColor: '#25292e',
     justifyContent: 'center',
     alignItems: 'center',
   },
   text: {
     color: '#fff',
   },
   logoutContainer: {
    
     bottom: 0,
     right: 20,
   },
 });
 