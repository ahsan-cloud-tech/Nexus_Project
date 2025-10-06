import { View, Text, StyleSheet } from 'react-native';
import React,{useEffect} from 'react';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';

export default function App() {
    const navigation = useNavigation();
    useEffect(()=>{
        setTimeout(()=>{
            navigation.navigate('Register');
        },3000);
    },[]);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Nexus</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: 'flex-end',
    alignItems: "center",
  },
  text: {
    marginBottom: hp('15%'), 
    fontSize: hp('5%'),   
    fontWeight: "bold",
  },
});
