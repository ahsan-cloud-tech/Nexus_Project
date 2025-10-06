// import { 
//   View, 
//   Text, 
//   Image, 
//   StyleSheet, 
//   KeyboardAvoidingView, 
//   ScrollView, 
//   Platform 
// } from 'react-native';
// import React, { useState } from 'react';
// import {
//   heightPercentageToDP as hp,
//   widthPercentageToDP as wp,
// } from 'react-native-responsive-screen';
// import Input from '../Components/Input';
// import LoginBtn from '../Components/LoginBtn';
// import * as Animatable from 'react-native-animatable';

// export default function SignUp() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmpassword, setConfirmPassword] = useState('');
//   const [name, setName] = useState('');
//   const [surname, setSurName] = useState('');

//   // 👇 separate states
//   const [securePassword, setSecurePassword] = useState(true);
//   const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

//   return (
//     <KeyboardAvoidingView 
//       style={{ flex: 1 }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <ScrollView 
//         contentContainerStyle={styles.scrollContainer}
//         keyboardShouldPersistTaps="handled"
//       >
//         <Animatable.View 
//           animation="fadeInUp"
//           duration={1200}
//           style={styles.container}
//         >
//           {/* Logo */}
//           <Animatable.View 
//             animation="bounceIn"
//             duration={1500}
//             delay={200}
//           >
//             <Image 
//               source={require('../assets/images/logos.png')} 
//               style={{
//                 alignItems: "center", 
//                 height: hp('20%'), 
//                 width: wp('80%'), 
//                 justifyContent: "center",
//                 marginBottom: hp('-3%'),
//               }} 
//             />
//           </Animatable.View>

//           {/* Subtitle */}
//           <Animatable.Text 
//             animation="fadeInDown"
//             duration={1000}
//             delay={400}
//             style={styles.subtitle}
//           >
//             Create account
//           </Animatable.Text>

//           {/* Name */}
//           <Animatable.View animation="fadeInLeft" duration={800} delay={600} style={{ width: '100%' }}>
//             <Text style={styles.label}>Name</Text>
//             <Input value={name} onChangeText={setName} style={{ textAlign: "center" }} />
//           </Animatable.View>

//           {/* Surname */}
//           <Animatable.View animation="fadeInRight" duration={800} delay={800} style={{ width: '100%' }}>
//             <Text style={styles.label}>Surname</Text>
//             <Input value={surname} onChangeText={setSurName} style={{ textAlign: "center" }} />
//           </Animatable.View>

//           {/* Email */}
//           <Animatable.View animation="fadeInLeft" duration={800} delay={1000} style={{ width: '100%' }}>
//             <Text style={styles.label}>Email</Text>
//             <Input value={email} onChangeText={setEmail} style={{ textAlign: "center" }} />
//           </Animatable.View>

//           {/* Password */}
//           <Animatable.View animation="fadeInRight" duration={800} delay={1200} style={{ width: '100%' }}>
//             <Text style={styles.label}>Password</Text>
//             <Input
//               secureTextEntry={securePassword}
//               value={password}
//               onChangeText={setPassword}
//               showPasswordToggle={true}
//               onTogglePassword={() => setSecurePassword(!securePassword)} // 👈 only password toggle
//               style={{ textAlign: "center" }}
//             />
//           </Animatable.View>

//           {/* Confirm Password */}
//           <Animatable.View animation="fadeInLeft" duration={800} delay={1400} style={{ width: '100%' }}>
//             <Text style={styles.label}>Confirm Password</Text>
//             <Input 
//               value={confirmpassword} 
//               onChangeText={setConfirmPassword} 
//               showPasswordToggle={true}
//               onTogglePassword={() => setSecureConfirmPassword(!secureConfirmPassword)} // 👈 only confirm password toggle
//               secureTextEntry={secureConfirmPassword}
//               style={{ textAlign: "center" }}
//             />
//           </Animatable.View>

//           {/* Button */}
//           <Animatable.View animation="zoomIn" duration={1000} delay={1600} style={{ marginTop: hp('3%') }}>
//             <LoginBtn title="Create Account" />
//           </Animatable.View>
//         </Animatable.View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: "center",
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingBottom: hp('2%'),
//   },
//   subtitle: {
//     marginBottom: hp('2%'),
//     fontSize: hp('2.5%'),
//     color: '#C4C4C4',
//     fontFamily:'Poppins-Regular'
//   },
//   label: {
//     alignSelf: 'flex-start',
//     fontSize: hp('2.2%'),
//     marginBottom: hp('0.5%'),
//     color: '#000',
//     marginHorizontal: wp('5.3%'), 
//     fontFamily:"Poppins-Regular"
//   },
// });


import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform, 
  ActivityIndicator 
} from 'react-native';
import React, { useState } from 'react';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Input from '../Components/Input';
import LoginBtn from '../Components/LoginBtn';
import * as Animatable from 'react-native-animatable';
import Toast from 'react-native-toast-message';
import { baseUrl } from '../utils/Api';

export default function SignUp({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('IT'); // simple text (API expects array)
  const [companyAddress, setCompanyAddress] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [loading, setLoading] = useState(false);

  // 👇 separate states for password toggle
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

  const handleRegister = async () => {
    if (!email || !password || !confirmpassword || !name || !companyName) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill all required fields",
      });
      return;
    }

    if (password !== confirmpassword) {
      Toast.show({
        type: "error",
        text1: "Password Mismatch",
        text2: "Passwords do not match",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/users/register-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name + " " + surname,
          company_name: companyName,
          industry: [industry], // array of string
          device_token: "dummy-device-token-12345", // replace with real token
          company_address: companyAddress,
          contact_no: contactNo,
          email: email,
          password: password,
          plan: "64a2b8f1234abcd56789ef01", // fake plan id (API expects ObjectId)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Registration Successful 🎉",
          text2: data.message || "Proceed to next step",
        });
        // 👉 navigate to step-2 or login
        setTimeout(() => {
          setLoading(false);
          navigation.navigate("Login");
        }, 1000);
      } else {
        Toast.show({
          type: "error",
          text1: "Registration Failed ❌",
          text2: data.message || "Please try again",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      Toast.show({
        type: "error",
        text1: "Network Error ❌",
        text2: "Please check your internet connection",
      });
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animatable.View 
          animation="fadeInUp"
          duration={1200}
          style={styles.container}
        >
          {/* Logo */}
          <Animatable.View 
            animation="bounceIn"
            duration={1500}
            delay={200}
          >
            <Image 
              source={require('../assets/images/logos.png')} 
              style={{
                alignItems: "center", 
                height: hp('20%'), 
                width: wp('80%'), 
                justifyContent: "center",
                marginBottom: hp('-3%'),
              }} 
            />
          </Animatable.View>

          {/* Subtitle */}
          <Animatable.Text 
            animation="fadeInDown"
            duration={1000}
            delay={400}
            style={styles.subtitle}
          >
            Create account
          </Animatable.Text>

          {/* Name */}
          <Text style={styles.label}>Name</Text>
          <Input value={name} onChangeText={setName} />

          {/* Surname */}
          <Text style={styles.label}>Surname</Text>
          <Input value={surname} onChangeText={setSurName} />

          {/* Company Name */}
          <Text style={styles.label}>Company Name</Text>
          <Input value={companyName} onChangeText={setCompanyName} />

          {/* Industry */}
          <Text style={styles.label}>Industry</Text>
          <Input value={industry} onChangeText={setIndustry} />

          {/* Company Address */}
          <Text style={styles.label}>Company Address</Text>
          <Input value={companyAddress} onChangeText={setCompanyAddress} />

          {/* Contact No */}
          <Text style={styles.label}>Contact No</Text>
          <Input value={contactNo} onChangeText={setContactNo} />

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <Input value={email} onChangeText={setEmail} />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <Input
            secureTextEntry={securePassword}
            value={password}
            onChangeText={setPassword}
            showPasswordToggle={true}
            onTogglePassword={() => setSecurePassword(!securePassword)}
          />

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <Input 
            value={confirmpassword} 
            onChangeText={setConfirmPassword} 
            showPasswordToggle={true}
            onTogglePassword={() => setSecureConfirmPassword(!secureConfirmPassword)}
            secureTextEntry={secureConfirmPassword}
          />

          {/* Register Button */}
          <View style={{ marginTop: hp("3%") }}>
            {loading ? (
              <View style={styles.loginBtn}>
                <ActivityIndicator color="#fff" />
              </View>
            ) : (
              <LoginBtn title="Create Account" onPress={handleRegister} />
            )}
          </View>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: hp('2%'),
  },
  subtitle: {
    marginBottom: hp('2%'),
    fontSize: hp('2.5%'),
    color: '#C4C4C4',
    fontFamily:'Poppins-Regular'
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: hp('2.2%'),
    marginBottom: hp('0.5%'),
    color: '#000',
    marginHorizontal: wp('5.3%'), 
    fontFamily:"Poppins-Regular"
  },
  loginBtn: {
    width: wp("90%"),
    height: hp("7%"),
    borderRadius: 10,
    backgroundColor: "#3e8ef0",
    justifyContent: "center",
    alignItems: "center",
  }
});
