// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import Register from '../Auth/Register';
// import Login from '../Auth/Login';
// import SignUp from '../Auth/SignUp';
// import CurrentProjectsPhases from "../DrawerTab/SubScreen/CurrentProjectsPhases"

// import DrawerNavigator from './DrawerNavigator';
// import DesignTask from '../DrawerTab/DesignPhase/DesignTask';
// import DesignList from '../DrawerTab/DesignPhase/DesignList';
// import CoreTask from '../DrawerTab/FinishPhase/CoreTask';
// import LevelsTask from '../DrawerTab/FinishPhase/LevelsTask';
// import UnitTask from '../DrawerTab/FinishPhase/UnitTask';
// import Header from '../Components/Header';

// const Stack = createNativeStackNavigator();

// export default function AppNavigator() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator>
//         <Stack.Screen
//           name="Register"
//           component={Register}
//           options={{ headerShown: false }}
//         />
//         <Stack.Screen
//           name="Login"
//           component={Login}
//           options={{ headerShown: false }}
//         />
//         <Stack.Screen
//           name="SignUp"
//           component={SignUp}
//           options={{ headerShown: false }}
//         />
//         <Stack.Screen
//           name="Main"
//           component={DrawerNavigator}
//           options={{ headerShown: false }}
//         />
//          <Stack.Screen 
//           name='CurrentProjectsPhases'
//           component={CurrentProjectsPhases}
//           options={({ navigation }) => ({
//             headerShown: true,
//             header: () => (
//               <Header toggleDrawer={() => navigation.getParent()?.toggleDrawer()} />
//             ),
//           })}
//         />
//         <Stack.Screen name='DesignTask' component={DesignTask}     options={{ headerShown: false }} />
//         <Stack.Screen name='DesignList' component={DesignList}     options={{ headerShown: false }} />
//         <Stack.Screen name='CoreTask' component={CoreTask}     options={{ headerShown: false }} />
//         <Stack.Screen name='LevelsTask' component={LevelsTask}     options={{ headerShown: false }} />
//         <Stack.Screen name='UnitTask' component={UnitTask}     options={{ headerShown: false }} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };


import React from "react";
import { useSelector } from "react-redux";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Register from "../Auth/Register";
import Login from "../Auth/Login";
import SignUp from "../Auth/SignUp";
import DrawerNavigator from "./DrawerNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const token = useSelector((state) => state.auth.token);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <Stack.Screen name="Main" component={DrawerNavigator} />
      ) : (
        <>
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignUp" component={SignUp} />
        </>
      )}
    </Stack.Navigator>
  );
}

