import React from "react";
import AppNavigator from "./src/Navigator/AppNavigator";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./src/Store/store";
import { NavigationContainer } from "@react-navigation/native";
import AuthChecker from "./src/Components/AuthChecker"; 

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <AppNavigator />
          <AuthChecker />
          <Toast />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}