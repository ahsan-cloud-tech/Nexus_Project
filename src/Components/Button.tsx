import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function Button({ title, onPress, bgColor }) {
  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: bgColor }]} 
      onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: wp('60%'),      
    height: hp('5.7%'),   
    borderRadius: wp('3%'),
    alignItems: "center",
    justifyContent: "center",
    marginVertical: hp('1.5%'),
  },
  text: {
    color: "#fff",
    fontSize: hp('2.2%'), fontFamily:'Poppins-Regular'
  },
});
