// import { 
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   Image, 
//   ScrollView, 
//   KeyboardAvoidingView, 
//   Platform,
//   ActivityIndicator
// } from 'react-native';
// import React, { useState, useRef } from 'react';
// import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
// import * as Animatable from 'react-native-animatable';
// import Input from '../Components/Input';
// import LoginBtn from '../Components/LoginBtn';
// import { useNavigation } from '@react-navigation/native';
// import { Formik } from 'formik';
// import * as Yup from 'yup';
// import Toast from 'react-native-toast-message';
// import { baseUrl } from '../utils/Api';
// import { useDispatch } from "react-redux";   // ✅ Redux
// import { login } from "../Store/store";            // ✅ Action import

// // ✅ Validation schema
// const LoginSchema = Yup.object().shape({
//   id: Yup.string().required("Account Id is required"),
//   email: Yup.string().email("Invalid email format").required("Email is required"),
//   password: Yup.string().min(3, "Password must be at least 3 characters").required("Password is required"),
// });

// export default function Login() {
//   const [secureText, setSecureText] = useState(true);
//   const [loading, setLoading] = useState(false); 
//   const navigation = useNavigation();
//   const formRef = useRef(null);
//   const dispatch = useDispatch();   // ✅ Redux dispatch

//   const handleSubmit = async (values) => {
//     setLoading(true); 
//     try {
//       const response = await fetch(`${baseUrl}/users/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           unique_id: values.id,
//           email: values.email,
//           password: values.password,
//           device_token: "dummy-device-token-12345",
//         }),
//       });

//       const data = await response.json();

//       if (response.ok && data.token) {
//         // ✅ Redux me token save (Redux Persist handle karega storage)
//         dispatch(login(data.token));

//         Toast.show({
//           type: "success",
//           text1: "Login Successful 🎉",
//           text2: data.message || "Welcome back!",
//           position: "top",
//         });

//         setTimeout(() => {
//           setLoading(false);
//           // ❌ navigation.replace("Main") ki zaroorat nahi
//           // Redux state change hote hi App Navigator auto update karega
//         }, 1000);
//       } else {
//         formRef.current?.shake(800);
//         Toast.show({
//           type: "error",
//           text1: "Login Failed ❌",
//           text2: data.message || "Invalid credentials",
//           position: "top",
//         });
//         setLoading(false);
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       Toast.show({
//         type: "error",
//         text1: "Network Error ❌",
//         text2: "Please try again later",
//         position: "top",
//       });
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, backgroundColor: '#fff' }}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <ScrollView
//         contentContainerStyle={styles.scrollContainer}
//         keyboardShouldPersistTaps="handled"
//       >
//         <Animatable.View animation="bounceIn" duration={1500} delay={200}>
//           <Image 
//             source={require('../assets/images/logos.png')} 
//             style={{
//               alignItems:"center", 
//               height:hp('20%'), 
//               width:wp('80%'), 
//               justifyContent:"center",
//               marginBottom: hp('-3%'),
//             }} 
//           />
//         </Animatable.View>

//         <Animatable.Text 
//           animation="fadeInDown"
//           duration={1000}
//           delay={400}
//           style={styles.subtitle}
//         >
//           Login to your account
//         </Animatable.Text>

//         <Formik
//           initialValues={{ email: '', password: '', id: '' }}
//           validationSchema={LoginSchema}
//           onSubmit={handleSubmit}
//         >
//           {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
//             <Animatable.View 
//               ref={formRef}
//               animation="fadeInUp"
//               duration={1000}
//               delay={600}
//               style={{ width: "100%", alignItems:"center" }}
//             >
//               {/* Account ID */}
//               <Animatable.View animation="fadeInLeft" duration={800} delay={800} style={{ width: "100%" }}>
//                 <Text style={styles.label}>Account Id</Text>
//                 <Input
//                   placeholder="Account Id"
//                   value={values.id}
//                   onChangeText={handleChange('id')}
//                   onBlur={handleBlur('id')}
//                 />
//                 {errors.id && touched.id && (
//                   <Animatable.Text animation="fadeInLeft" duration={300} style={styles.errorText}>
//                     {errors.id}
//                   </Animatable.Text>
//                 )}
//               </Animatable.View>

//               {/* Email */}
//               <Animatable.View animation="fadeInLeft" duration={800} delay={900} style={{ width: "100%" }}>
//                 <Text style={styles.label}>Email</Text>
//                 <Input
//                   placeholder="Email"
//                   value={values.email}
//                   onChangeText={handleChange('email')}
//                   onBlur={handleBlur('email')}
//                 />
//                 {errors.email && touched.email && (
//                   <Animatable.Text animation="fadeInLeft" duration={300} style={styles.errorText}>
//                     {errors.email}
//                   </Animatable.Text>
//                 )}
//               </Animatable.View>

//               {/* Password */}
//               <Animatable.View animation="fadeInRight" duration={800} delay={1000} style={{ width: "100%", marginTop: hp('2%') }}>
//                 <Text style={styles.label}>Password</Text>
//                 <Input
//                   placeholder="Password"
//                   value={values.password}
//                   onChangeText={handleChange('password')}
//                   onBlur={handleBlur('password')}
//                   secureTextEntry={secureText}
//                   showPasswordToggle={true}
//                   onTogglePassword={() => setSecureText(!secureText)}
//                 />
//                 {errors.password && touched.password && (
//                   <Animatable.Text animation="fadeInLeft" duration={300} style={styles.errorText}>
//                     {errors.password}
//                   </Animatable.Text>
//                 )}
//               </Animatable.View>

//               {/* Login Button with Loader */}
//               <Animatable.View animation="zoomIn" duration={800} delay={1200} style={{ marginTop: hp('3%') }}>
//                 {loading ? (
//                   <View style={styles.loginBtn}>
//                     <ActivityIndicator color="#fff" />
//                   </View>
//                 ) : (
//                   <LoginBtn title="Log In" onPress={handleSubmit} />
//                 )}
//               </Animatable.View>

//               {/* Extra links */}
//               <Animatable.View animation="fadeIn" duration={1000} delay={1400} style={{ alignSelf:"flex-start", marginHorizontal:wp('5.4%'), marginTop: hp('2%') }}>
//                 <TouchableOpacity>
//                   <Text style={styles.forgottext}>Forgot your password?</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity>
//                   <Text style={[styles.forgottext,{ marginTop:hp('1%') }]}>
//                     Trouble logging in?
//                   </Text>
//                 </TouchableOpacity>
//               </Animatable.View>
//             </Animatable.View>
//           )}
//         </Formik>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: hp('5%'), paddingBottom:wp('5%')
//   },
//   forgottext:{
//     color:"#3e8ef0",
//     fontSize:hp('2%'), 
//     fontWeight:"400", 
//     fontFamily:'Poppins-Regular'
//   },
//   subtitle: {
//     marginBottom: hp('5%'),
//     fontSize: hp('2.5%'),
//     color: '#C4C4C4', 
//     fontFamily:"Poppins-Regular"
//   },
//   label: {
//     alignSelf: 'flex-start',
//     fontSize: hp('2.2%'),
//     marginBottom: hp('0.5%'),
//     color: '#000', 
//     marginHorizontal:wp('5.3%'), 
//     fontFamily:"Poppins-Regular"
//   },
//   errorText: {
//     color: 'red',
//     fontSize: hp('1.8%'),
//     marginLeft: wp('5.3%'),
//     marginBottom: hp('1%'),
//     alignSelf: 'flex-start',
//   },
//   loginBtn: {
//     width: wp("90%"),
//     height: hp("7%"),
//     borderRadius: 10,
//     backgroundColor: "#3e8ef0",
//     justifyContent: "center",
//     alignItems: "center",
//   }
// });


import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import React, { useState, useRef } from 'react';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import * as Animatable from 'react-native-animatable';
import Input from '../Components/Input';
import LoginBtn from '../Components/LoginBtn';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import { baseUrl } from '../utils/Api';
import { useDispatch } from "react-redux";
import { login } from "../Store/store";

const LoginSchema = Yup.object().shape({
  id: Yup.string().required("Account Id is required"),
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().min(3, "Password must be at least 3 characters").required("Password is required"),
});

export default function Login() {
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false); 
  const navigation = useNavigation();
  const formRef = useRef(null);
  const scrollViewRef = useRef(null); // ✅ Add scrollViewRef
  const dispatch = useDispatch();

  // ✅ Function to handle scroll when input is focused
  const handleInputFocus = (event) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: event.nativeEvent.target.offsetTop - 100,
        animated: true
      });
    }, 100);
  };

  const handleSubmit = async (values) => {
    setLoading(true); 
    try {
      const response = await fetch(`${baseUrl}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unique_id: values.id,
          email: values.email,
          password: values.password,
          device_token: "dummy-device-token-12345",
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        dispatch(login(data.token));

        Toast.show({
          type: "success",
          text1: "Login Successful 🎉",
          text2: data.message || "Welcome back!",
          position: "top",
        });

        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } else {
        formRef.current?.shake(800);
        Toast.show({
          type: "error",
          text1: "Login Failed ❌",
          text2: data.message || "Invalid credentials",
          position: "top",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      Toast.show({
        type: "error",
        text1: "Network Error ❌",
        text2: "Please try again later",
        position: "top",
      });
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === "ios" ? "padding" : "height"} // ✅ Better behavior
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // ✅ Adjust offset
    >
      <ScrollView
        ref={scrollViewRef} // ✅ Add ref to ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false} // ✅ Prevent excessive bouncing
      >
        <Animatable.View animation="bounceIn" duration={1500} delay={200}>
          <Image 
            source={require('../assets/images/logos.png')} 
            style={{
              alignItems:"center", 
              height:hp('20%'), 
              width:wp('80%'), 
              justifyContent:"center",
              marginBottom: hp('-3%'),
            }} 
          />
        </Animatable.View>

        <Animatable.Text 
          animation="fadeInDown"
          duration={1000}
          delay={400}
          style={styles.subtitle}
        >
          Login to your account
        </Animatable.Text>

        <Formik
          initialValues={{ email: '', password: '', id: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <Animatable.View 
              ref={formRef}
              animation="fadeInUp"
              duration={1000}
              delay={600}
              style={{ width: "100%", alignItems:"center" }}
            >
              {/* Account ID */}
              <Animatable.View animation="fadeInLeft" duration={800} delay={800} style={{ width: "100%" }}>
                <Text style={styles.label}>Account Id</Text>
                <Input
                  placeholder="Account Id"
                  value={values.id}
                  onChangeText={handleChange('id')}
                  onBlur={handleBlur('id')}
                  onFocus={handleInputFocus} // ✅ Add onFocus handler
                />
                {errors.id && touched.id && (
                  <Animatable.Text animation="fadeInLeft" duration={300} style={styles.errorText}>
                    {errors.id}
                  </Animatable.Text>
                )}
              </Animatable.View>

              {/* Email */}
              <Animatable.View animation="fadeInLeft" duration={800} delay={900} style={{ width: "100%" }}>
                <Text style={styles.label}>Email</Text>
                <Input
                  placeholder="Email"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  onFocus={handleInputFocus} // ✅ Add onFocus handler
                />
                {errors.email && touched.email && (
                  <Animatable.Text animation="fadeInLeft" duration={300} style={styles.errorText}>
                    {errors.email}
                  </Animatable.Text>
                )}
              </Animatable.View>

              {/* Password */}
              <Animatable.View animation="fadeInRight" duration={800} delay={1000} style={{ width: "100%", marginTop: hp('2%') }}>
                <Text style={styles.label}>Password</Text>
                <Input
                  placeholder="Password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry={secureText}
                  showPasswordToggle={true}
                  onTogglePassword={() => setSecureText(!secureText)}
                  onFocus={handleInputFocus} // ✅ Add onFocus handler
                />
                {errors.password && touched.password && (
                  <Animatable.Text animation="fadeInLeft" duration={300} style={styles.errorText}>
                    {errors.password}
                  </Animatable.Text>
                )}
              </Animatable.View>

              {/* Login Button with Loader */}
              <Animatable.View animation="zoomIn" duration={800} delay={1200} style={{ marginTop: hp('3%') }}>
                {loading ? (
                  <View style={styles.loginBtn}>
                    <ActivityIndicator color="#fff" />
                  </View>
                ) : (
                  <LoginBtn title="Log In" onPress={handleSubmit} />
                )}
              </Animatable.View>

              {/* Extra links */}
              <Animatable.View animation="fadeIn" duration={1000} delay={1400} style={{ alignSelf:"flex-start", marginHorizontal:wp('5.4%'), marginTop: hp('2%') }}>
                <TouchableOpacity>
                  <Text style={styles.forgottext}>Forgot your password?</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={[styles.forgottext,{ marginTop:hp('1%') }]}>
                    Trouble logging in?
                  </Text>
                </TouchableOpacity>
              </Animatable.View>
            </Animatable.View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: hp('5%'), 
    paddingBottom: wp('15%') // ✅ Increase bottom padding for better scroll
  },
  forgottext:{
    color:"#3e8ef0",
    fontSize:hp('2%'), 
    fontWeight:"400", 
    fontFamily:'Poppins-Regular'
  },
  subtitle: {
    marginBottom: hp('5%'),
    fontSize: hp('2.5%'),
    color: '#C4C4C4', 
    fontFamily:"Poppins-Regular"
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: hp('2.2%'),
    marginBottom: hp('0.5%'),
    color: '#000', 
    marginHorizontal:wp('5.3%'), 
    fontFamily:"Poppins-Regular"
  },
  errorText: {
    color: 'red',
    fontSize: hp('1.8%'),
    marginLeft: wp('5.3%'),
    marginBottom: hp('1%'),
    alignSelf: 'flex-start',
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