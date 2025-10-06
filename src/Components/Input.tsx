import { TextInput, StyleSheet, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Ionicons from '@react-native-vector-icons/ionicons';

export default function Input({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  showPasswordToggle = false,
  onTogglePassword,
}) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#999"
      />
      {showPasswordToggle && (
        <TouchableOpacity style={styles.icon} onPress={onTogglePassword}>
          <Ionicons
            name={secureTextEntry ? 'eye-off' : 'eye'}
            size={22}
            color="gray"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: wp('80%'),
    marginVertical: hp('1.5%'),
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    paddingHorizontal: wp('3%'), alignSelf:"center"
  },
  input: {
    flex: 1,
    height: hp('6.5%'),
    fontSize: hp('2%'),
    color: '#000',
  },
  icon: {
    marginLeft: wp('2%'),
  },
});
