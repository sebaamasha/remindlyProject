import React from 'react';
import { View, Text, StyleSheet, SafeAreaView ,Image ,TouchableOpacity} from 'react-native';
import { useLogin} from "../app/auth/LoginContext";

const Header: React.FC = () => {
  const { isLoginComplete, setIsLoginComplete , setUserId } = useLogin();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
      <Image source={require('../assets/images/HeaderLogo.png')} style={styles.Logo} />
      <TouchableOpacity onPress={() =>
        {
          setIsLoginComplete(false);
          setUserId('');
        } }>
          <Text style={styles.headerText}>Log out</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    width: '100%',
    paddingTop: 20, 
  },
  header: {
    height: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignContent: 'center',
    shadowColor: '#000',
    borderWidth: 1,
    borderColor: '#DF6316',    
    marginTop: 20, 
  },
  headerText: {
    color: '#DF6316',
    fontSize: 16,
    top: -4,
    left: 330,
    fontWeight: 'bold',
    height:50,

  },
  Logo: {
    top: 22,
    width: 151,
    height: 31,
  }
});

export default Header;
