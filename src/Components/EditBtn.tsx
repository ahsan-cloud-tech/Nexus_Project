import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function EditBtn({ title, onPress, bgColor }) {
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
    width: wp('25%'),      
    height: hp('4.5%'),   
    borderRadius: wp('3%'),
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontSize: hp('1.5%'), fontFamily:'Poppins-Regular'
  },
});
