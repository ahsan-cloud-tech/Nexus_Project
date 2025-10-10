import React from "react";
import { useSelector } from "react-redux";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Register from "../Auth/Register";
import Login from "../Auth/Login";
import SignUp from "../Auth/SignUp";
import DrawerNavigator from "./DrawerNavigator";
import AllNotification from "../Notifications/AllNotification";
import CurrentProjectsPhases from "../DrawerTab/SubScreen/CurrentProjectsPhases";
import Header from "../Components/Header";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const token = useSelector((state) => state.auth.token);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="Main" component={DrawerNavigator} />
          <Stack.Screen name="AllNotification" component={AllNotification} />
          <Stack.Screen name="CurrentProjectsPhases" component={CurrentProjectsPhases} 
           options={({ navigation }) => ({
                    headerShown: true,
                    header: () => (
                      <Header toggleDrawer={() => navigation.getParent('Projects')?.openDrawer()} />
                    ),
                  })} 
          />
        </>
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
