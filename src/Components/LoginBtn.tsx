import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import colors from '../Constants/Color';

export default function LoginBtn({ title, onPress }) {
  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: colors.baseColor }]} 
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: wp('80%'),      
    height: hp('7%'),   
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
