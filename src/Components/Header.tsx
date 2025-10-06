import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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