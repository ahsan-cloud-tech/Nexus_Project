// import React from 'react';
// import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle } from 'react-native';
// import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

// type MultilineInputProps = {
//   label?: string;
//   placeholder?: string;
//   value: string;
//   onChangeText: (text: string) => void;
//   maxLength?: number;
//   containerStyle?: ViewStyle;
//   inputStyle?: TextStyle;
// };

// export default function MultilineInput({
//   label,
//   placeholder,
//   value,
//   onChangeText,
//   maxLength,
//   containerStyle,
//   inputStyle,
// }: MultilineInputProps) {
//   const count = value?.length ?? 0;

//   return (
//     <View style={[styles.container, containerStyle]}>
//       {!!label && (
//         <View style={styles.headerRow}>
//           <Text style={styles.label}>{label}</Text>
//           {typeof maxLength === 'number' && (
//             <Text style={styles.counter}>
//               {count} / {maxLength}
//             </Text>
//           )}
//         </View>
//       )}

//       <TextInput
//         style={[styles.input, inputStyle]}
//         placeholder={placeholder}
//         placeholderTextColor="#8c8c8c"
//         value={value}
//         onChangeText={onChangeText}
//         maxLength={maxLength}
//         multiline
//         blurOnSubmit={false}
//         returnKeyType="default"
//         textAlignVertical="top"
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: hp('2%'), 
//   },
//   headerRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: hp('0.8%'), // responsive gap
//   },
//   label: {
//     fontSize: hp('1.8%'), // responsive font
//     fontWeight: 'bold',
//     color: '#222',
//   },
//   counter: {
//     fontSize: hp('1.6%'), // responsive font
//     color: '#888',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: wp('2%'), // responsive rounded corners
//     padding: hp('1.5%'), // responsive padding
//     fontSize: hp('1.8%'), // responsive font
//     backgroundColor: '#fafafa',
//     minHeight: hp('12%'), // responsive height for multiline
//   },
// });


import React, { useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';

type MultilineInputProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
};

export default function MultilineInput({
  label,
  placeholder,
  value,
  onChangeText,
  maxLength,
  containerStyle,
  inputStyle,
}: MultilineInputProps) {
  const count = value?.length ?? 0;
  const textInputRef = useRef<TextInput>(null);

  return (
    <View style={[styles.container, containerStyle]}>
      {!!label && (
        <View style={styles.headerRow}>
          <Text style={styles.label}>{label}</Text>
          {typeof maxLength === 'number' && (
            <Text style={styles.counter}>
              {count} / {maxLength}
            </Text>
          )}
        </View>
      )}

      <TextInput
        ref={textInputRef}
        style={[styles.input, inputStyle]}
        placeholder={placeholder}
        placeholderTextColor="#8c8c8c"
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        multiline
        blurOnSubmit={false}
        returnKeyType="default"
        textAlignVertical="top"
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: hp('2%'), 
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('0.8%'),
  },
  label: {
    fontSize: hp('1.8%'),
    fontWeight: 'bold',
    color: '#222',
  },
  counter: {
    fontSize: hp('1.6%'),
    color: '#888',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: wp('2%'),
    padding: hp('1.5%'),
    fontSize: hp('1.8%'),
    backgroundColor: '#fafafa',
    minHeight: hp('12%'),
  },
});