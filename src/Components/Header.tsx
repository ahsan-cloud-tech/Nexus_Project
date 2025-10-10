import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import Ionicons from '@react-native-vector-icons/ionicons';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import colors from '../Constants/Color';

export default function Header({ toggleDrawer }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleDrawer}>
        <Ionicons name="menu" color="#fff" size={hp('4%')} />
      </TouchableOpacity>
      
      {/* Centered Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../src/assets/images/logos.png')} 
          style={styles.logo}
        />
      </View>
      
      <View style={styles.userContainer}>
        <Ionicons name="person" color="#fff" size={hp('3.4%')} />
        <Text style={styles.userText}>User</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp('10%'),
    backgroundColor: colors.baseColor,
    width: wp('100%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
  },
  logoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: wp('30%'),
    height: hp('10%'),
    resizeMode: 'cover'
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: hp('2.2%'),
    fontWeight: '600',
  },
});