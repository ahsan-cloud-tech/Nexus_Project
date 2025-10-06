import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import Button from '../Components/Button';

export default function Register() {
  const navigation = useNavigation();
  const { width } = Dimensions.get('window');
  const isSmallDevice = width < 360;

  return (
    <ImageBackground
      source={require('../assets/images/build.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Logo with bounce animation */}
        <Animatable.Image
          animation="bounceIn"
          duration={1500}
          delay={300}
          source={require('../assets/images/logos.png')}
          style={{
            alignItems: 'center',
            marginTop: hp('7%'),
            height: hp('10%'),
            width: wp('90%'),
            justifyContent: 'center',
            alignSelf: 'center',
          }}
        />

        <View style={styles.subcontainer}>
          <Animatable.Text
            animation="fadeInDown"
            duration={1200}
            style={[
              styles.subtext1,
              { fontSize: isSmallDevice ? hp('2%') : hp('2.6%') },
            ]}
          >
            Managing construction or{'\n'}
            <Text style={{ fontFamily: 'Poppins-ExtraBold' }}>
            development projects?
            </Text>
          </Animatable.Text>

          <Animatable.Text
            animation="fadeInUp"
            duration={1200}
            delay={400}
            style={styles.subtext}
          >
            Work smarter, collaborate better. Finish{'\n'}faster.
          </Animatable.Text>

          <Animatable.View
            animation="zoomIn"
            duration={1500}
            delay={600}
            style={{ justifyContent: 'center', alignItems: 'center' }}
          >
            <Button
              title="Sign In"
              onPress={() => navigation.navigate('Login')}
              bgColor="#1d9b20"
            />
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.acnttext}>Create Account</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  acnttext: {
    color: '#fff',
    fontSize: hp('2.6%'),
    textAlign: 'center',
    marginTop: hp('0.2%'),
    fontFamily: 'Poppins-Regular',
  },
  subcontainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: hp('10%'),
    paddingHorizontal: wp('2%'),
    alignItems: 'center',
  },
  subtext: {
    fontSize: hp('1.8%'),
    marginBottom: hp('1%'),
    color: '#fff',
    marginHorizontal: wp('2%'),
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  subtext1: {
    marginBottom: hp('1%'),
    color: '#fff',
    fontFamily: 'Poppins-ExtraBold',
  },
});
