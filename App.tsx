import Realm from "realm";
Realm.flags.THROW_ON_GLOBAL_REALM = true;
import { ThemeProvider } from "styled-components/native";
import light from "./src/theme/light";
import { Routes } from "./src/Routes";
import { StatusBar } from "react-native";
import { AuthProvider } from "./src/hooks/auth";
import { RealmProvider } from "./src/hooks/realm";
import { AppProvider, UserProvider } from "@realm/react";
import { APP_ID } from "@env";
import { NavigationContainer } from "@react-navigation/native";
import { Authenticator } from "./src/screens/Public/Authenticator";
import { BluetoothProvider } from "./src/hooks/bluetooth";
import { HeartBeat } from "./src/databases/schemas/HeartBeat";
import { Position } from "./src/databases/schemas/Position";

export default function App() {
  return (
    <AppProvider id={APP_ID}>
      <ThemeProvider theme={light}>
        <StatusBar backgroundColor={"#855EE0"} />
        <AuthProvider>
          <BluetoothProvider>
            <NavigationContainer>
              <UserProvider fallback={Authenticator}>
                <RealmProvider
                  sync={{
                    flexible: true,
                    onError: console.error,
                  }}
                  schema={[HeartBeat, Position]}
                >
                  <Routes />
                </RealmProvider>
              </UserProvider>
            </NavigationContainer>
          </BluetoothProvider>
        </AuthProvider>
      </ThemeProvider>
    </AppProvider>
  );
}
