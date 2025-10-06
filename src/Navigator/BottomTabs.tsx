import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import Home from '../HomeTab/Home';
import Alert from '../HomeTab/Alert';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const Tab = createBottomTabNavigator();

export default function BottomTab() {
  const [showModal, setShowModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Home');

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarHideOnKeyboard: true,
          tabBarShowLabel: true,
          tabBarIcon: ({ size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = selectedTab === 'Home' ? 'home' : 'home-outline';
            } else if (route.name === 'Alert') {
              iconName =
                selectedTab === 'Alert'
                  ? 'notifications'
                  : 'notifications-outline';
            } else if (route.name === 'Settings') {
              iconName =
                selectedTab === 'Settings' ? 'settings' : 'settings-outline';
            }

            const color = selectedTab === route.name ? '#333' : '#C4C4C4';

            return (
              <View>
                <Ionicons name={iconName} size={size} color={color} />
                {route.name === 'Alert' && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>1</Text>
                  </View>
                )}
              </View>
            );
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: false,
            tabBarLabel: ({ focused }) => (
              <Text style={{ color: 'black', fontSize: 12 }}>Home</Text>
            ),
          }}
          listeners={{
            tabPress: () => setSelectedTab('Home'),
          }}
        />

        <Tab.Screen
          name="Alert"
          component={Alert}
          options={{
            headerShown: false,
            tabBarLabel: ({ focused }) => (
              <Text style={{ color: 'black', fontSize: 12 }}>Alert</Text>
            ),
          }}
          listeners={{
            tabPress: e => {
              e.preventDefault();
              setSelectedTab('Alert');
              setShowAlertModal(true);
            },
          }}
        />
        <Tab.Screen
          name="Settings"
          component={() => <View />}
          options={{ headerShown: false }}
          listeners={{
            tabPress: e => {
              e.preventDefault();
              setSelectedTab('Settings');
              setShowModal(true);
            },
          }}
        />
      </Tab.Navigator>
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalBox}>
                <TouchableOpacity style={styles.option}>
                  <Ionicons
                    name="person"
                    size={18}
                    color="#333"
                    style={styles.icon}
                  />
                </TouchableOpacity>
                <Text style={[styles.text, { marginHorizontal: wp('5%') }]}>
                  User (Alliance Project Group)
                </Text>
                <TouchableOpacity style={styles.option}>
                  <Ionicons
                    name="key"
                    size={18}
                    color="#333"
                    style={styles.icon}
                  />
                </TouchableOpacity>
                <Text style={[styles.text, { marginHorizontal: wp('5%') }]}>
                  Update Password
                </Text>
                <TouchableOpacity style={styles.option} >
                  <Ionicons
                    name="log-out-outline"
                    size={22}
                    color="red"
                    style={{ marginBottom: 4 }}
                  />
                </TouchableOpacity>
                <Text
                  style={[
                    styles.text,
                    { color: 'red', marginHorizontal: wp('5%') },
                  ]}
                >
                  Log out
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        visible={showAlertModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAlertModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAlertModal(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.alertModalBox}>
                <Text
                  style={{
                    fontSize: hp('2%'),
                    color: '#333',
                    fontFamily: 'Poppins-Regular',
                    marginHorizontal: wp('1.1%'),
                  }}
                >
                  Notifications
                </Text>
                <TouchableOpacity
                  style={styles.clickableTextContainer}
                  onPress={() => console.log('Text clicked')}
                >
                  <Text style={styles.clickableText}>
                    Read all notifications
                  </Text>
                </TouchableOpacity>
                <View style={styles.alertButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.alertButton, styles.cancelButton]}
                    onPress={() => setShowAlertModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Previous</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.alertButton, styles.okButton]}
                    onPress={() => {
                      console.log('OK button pressed');
                      setShowAlertModal(false);
                    }}
                  >
                    <Text style={styles.okButtonText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('5%'),
    width: wp('94%'),
    marginBottom: hp('8%'),
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  alertModalBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('5%'),
    width: wp('94%'),
    marginBottom: hp('8%'),
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('0.2%'),
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 15,
    color: '#333',
  },
  clickableTextContainer: {
    backgroundColor: '#f5f5f5',
    padding: wp('4%'),
    borderRadius: 8,
    marginVertical: hp('1.2%'),
  },
  clickableText: {
    fontSize: hp('2%'),
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  alertButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('0.1%'),
    marginBottom: wp('2%'),
  },
  alertButton: {
    width: wp('30%'),
    paddingVertical: hp('1.1%'),
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: wp('1%'),
  },
  cancelButton: {
    backgroundColor: '#4CAF50',
  },
  okButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#ffff',
    fontSize: 16,
    fontWeight: '600',
  },
  okButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
