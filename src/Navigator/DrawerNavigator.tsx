// import React from 'react';
// import { View, Text, Image, TouchableOpacity } from 'react-native';
// import {
//   createDrawerNavigator,
//   DrawerContentScrollView,
//   DrawerItemList,
// } from '@react-navigation/drawer';
// import Ionicons from '@react-native-vector-icons/ionicons';
// import colors from '../Constants/Color';
// import BottomTab from './BottomTabs';
// import FaqScreen from '../DrawerTab/FaqScreen';
// import {
//   heightPercentageToDP as hp,
//   widthPercentageToDP as wp,
// } from 'react-native-responsive-screen';
// import BottomTabsForProjects from './BottomTabsForProjects'; 

// const Drawer = createDrawerNavigator();

// function CustomDrawerContent(props) {
//   return (
//     <View style={{ flex: 1 }}>
//       <DrawerContentScrollView
//         {...props}
//         contentContainerStyle={{ paddingTop: hp('5%') }}
//       >
//         <View
//           style={{
//             alignItems: 'center',
//             padding: 15,
//             borderBottomWidth: 1,
//             borderColor: '#ddd',
//           }}
//         >
//           <Image
//             source={require('../assets/images/logos.png')}
//             style={{
//               width: wp('40%'),
//               height: hp('10%'),
//               borderRadius: 40,
//               marginBottom: 10,
//             }}
//           />
//           <Text
//             style={{
//               fontSize: hp(1.5),
//               fontFamily: 'Poppins-Regular',
//               marginBottom: hp('3%'),
//             }}
//           >
//             user@allianceprojectgroup.com.au
//           </Text>
//         </View>
//         <DrawerItemList {...props} />
//       </DrawerContentScrollView>
//       <View
//         style={{
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           padding: 15,
//           borderTopWidth: 1,
//           borderColor: '#ddd',
//         }}
//       >
//         <TouchableOpacity
//           style={{ flexDirection: 'row', alignItems: 'center' }}
//         >
//           <Text
//             style={{
//               marginLeft: 8,
//               fontSize: 15,
//               fontWeight: '500',
//               color: '#333',
//             }}
//           >
//             Logout
//           </Text>
//         </TouchableOpacity>
//         <Text style={{ fontSize: 14, color: '#555' }}>05/06/2025</Text>
//       </View>
//     </View>
//   );
// }

// export default function DrawerNavigator() {
//   return (
//     <Drawer.Navigator
//       drawerContent={props => <CustomDrawerContent {...props} />}
//       screenOptions={{
//         drawerActiveTintColor: colors.baseColor,
//         drawerInactiveTintColor: '#333',
//         drawerLabelStyle: {
//           fontSize: 16,
//           fontWeight: '500',
//         },
//         drawerItemStyle: {
//           marginHorizontal: 0,
//           paddingLeft: 5,
//         },
//         drawerStyle: {
//           backgroundColor: '#fff',
//           width: 250,
//         },
//         headerShown: false,
//       }}
//     >
//       <Drawer.Screen
//         name="MainTabs"
//         component={BottomTab}
//         options={{
//           title: 'Home',
//           drawerIcon: ({ size, color }) => (
//             <Ionicons name="home" color={color} size={size} />
//           ),
//           drawerItemStyle: {
//             borderBottomWidth: 1,
//             borderColor: '#ddd',
//             marginTop: hp('2%'),
//           },
//         }}
//       />
//       <Drawer.Screen
//         name="Projects"
//         component={BottomTabsForProjects} 
//         options={{
//           title: 'Projects',
//           drawerIcon: ({ size, color }) => (
//             <Ionicons name="folder" color={color} size={size} />
//           ),
//           drawerItemStyle: {
//             borderBottomWidth: 1,
//             borderColor: '#ddd',
//           },
//         }}
//       />
//       <Drawer.Screen
//         name="FAQ"
//         component={FaqScreen}
//         options={{
//           drawerIcon: ({ size, color }) => (
//             <Ionicons name="chatbubble-ellipses" color={color} size={size} />
//           ),
//           drawerItemStyle: {
//             borderBottomWidth: 1,
//             borderColor: '#ddd',
//           },
//         }}
//       />
//     </Drawer.Navigator>
//   );
// }


import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import Ionicons from '@react-native-vector-icons/ionicons';
import colors from '../Constants/Color';
import BottomTab from './BottomTabs';
import FaqScreen from '../DrawerTab/FaqScreen';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import ProjectsStackNavigator from './ProjectsStackNavigator'; 

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: hp('5%') }}
      >
        <View
          style={{
            alignItems: 'center',
            padding: 15,
            borderBottomWidth: 1,
            borderColor: '#ddd',
          }}
        >
          <Image
            source={require('../assets/images/logos.png')}
            style={{
              width: wp('40%'),
              height: hp('10%'),
              borderRadius: 40,
              marginBottom: 10,
            }}
          />
          <Text
            style={{
              fontSize: hp(1.5),
              fontFamily: 'Poppins-Regular',
              marginBottom: hp('3%'),
            }}
          >
            user@allianceprojectgroup.com.au
          </Text>
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 15,
          borderTopWidth: 1,
          borderColor: '#ddd',
        }}
      >
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Text
            style={{
              marginLeft: 8,
              fontSize: 15,
              fontWeight: '500',
              color: '#333',
            }}
          >
            Logout
          </Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 14, color: '#555' }}>05/06/2025</Text>
      </View>
    </View>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: colors.baseColor,
        drawerInactiveTintColor: '#333',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
        drawerItemStyle: {
          marginHorizontal: 0,
          paddingLeft: 5,
        },
        drawerStyle: {
          backgroundColor: '#fff',
          width: 250,
        },
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={BottomTab}
        options={{
          title: 'Home',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
          drawerItemStyle: {
            borderBottomWidth: 1,
            borderColor: '#ddd',
            marginTop: hp('2%'),
          },
        }}
      />
      <Drawer.Screen
        name="Projects"
        component={ProjectsStackNavigator} 
        options={{
          title: 'Projects',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="folder" color={color} size={size} />
          ),
          drawerItemStyle: {
            borderBottomWidth: 1,
            borderColor: '#ddd',
          },
        }}
      />
      <Drawer.Screen
        name="FAQ"
        component={FaqScreen}
        options={{
          drawerIcon: ({ size, color }) => (
            <Ionicons name="chatbubble-ellipses" color={color} size={size} />
          ),
          drawerItemStyle: {
            borderBottomWidth: 1,
            borderColor: '#ddd',
          },
        }}
      />
    </Drawer.Navigator>
  );
};