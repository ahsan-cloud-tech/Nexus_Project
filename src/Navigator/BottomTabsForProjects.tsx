import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import Alert from '../HomeTab/Alert';
import Settings from '../HomeTab/Settings';
import ProjectScreen from '../DrawerTab/ProjectScreen'; 

const Tab = createBottomTabNavigator();

export default function BottomTabsForProjects() {
  return (
  <Tab.Navigator
  screenOptions={({ route }) => ({
    headerShown: false,
    tabBarHideOnKeyboard:"true",
    tabBarActiveTintColor: '#333',
    tabBarInactiveTintColor: '#C4C4C4',
    tabBarIcon: ({ color, size }) => {
      let iconName;
      if (route.name === 'ProjectHome') {
        iconName = 'home';
      } else if (route.name === 'ProjectAlert') {
        iconName = 'notifications';
      } else if (route.name === 'ProjectSettings') {
        iconName = 'settings';
      }
      return <Ionicons name={iconName} size={size} color={color} />;
    },
  })}
>
  <Tab.Screen
    name="ProjectHome"
    component={ProjectScreen}
    options={{ title: 'Home' }}
  />
  <Tab.Screen
    name="ProjectAlert"
    component={Alert}
    options={{ title: 'Alert' }}
  />
  <Tab.Screen
    name="ProjectSettings"
    component={Settings}
    options={{ title: 'Settings' }}
  />
</Tab.Navigator>
  );
};
