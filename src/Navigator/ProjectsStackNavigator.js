import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabsForProjects from './BottomTabsForProjects';
import CurrentProjectsPhases from '../DrawerTab/SubScreen/CurrentProjectsPhases';
import DesignTask from '../DrawerTab/DesignPhase/DesignTask';
import DesignList from '../DrawerTab/DesignPhase/DesignList';
import CoreTask from '../DrawerTab/FinishPhase/CoreTask';
import LevelsTask from '../DrawerTab/FinishPhase/LevelsTask';
import UnitTask from '../DrawerTab/FinishPhase/UnitTask';
import Header from '../Components/Header';

const Stack = createNativeStackNavigator();

export default function ProjectsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProjectsHome"
        component={BottomTabsForProjects}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name='CurrentProjectsPhases'
        component={CurrentProjectsPhases}
        options={({ navigation }) => ({
          headerShown: true,
          header: () => (
            <Header toggleDrawer={() => navigation.getParent('Projects')?.openDrawer()} />
          ),
        })}
      />
      <Stack.Screen 
        name='DesignTask' 
        component={DesignTask}     
        options={({ navigation }) => ({
          headerShown: true,
          header: () => (
            <Header toggleDrawer={() => navigation.getParent('Projects')?.openDrawer()} />
          ),
        })}
      />
      <Stack.Screen 
        name='DesignList' 
        component={DesignList}     
        options={({ navigation }) => ({
          headerShown: true,
          header: () => (
            <Header toggleDrawer={() => navigation.getParent('Projects')?.openDrawer()} />
          ),
        })} 
      />
      <Stack.Screen 
        name='CoreTask' 
        component={CoreTask}     
        options={({ navigation }) => ({
          headerShown: true,
          header: () => (
            <Header toggleDrawer={() => navigation.getParent('Projects')?.openDrawer()} />
          ),
        })}
      />
      <Stack.Screen 
        name='LevelsTask' 
        component={LevelsTask}     
        options={({ navigation }) => ({
          headerShown: true,
          header: () => (
            <Header toggleDrawer={() => navigation.getParent('Projects')?.openDrawer()} />
          ),
        })}
      />
      <Stack.Screen 
        name='UnitTask' 
        component={UnitTask}     
        options={({ navigation }) => ({
          headerShown: true,
          header: () => (
            <Header toggleDrawer={() => navigation.getParent('Projects')?.openDrawer()} />
          ),
        })} 
      />
    </Stack.Navigator>
  );
}