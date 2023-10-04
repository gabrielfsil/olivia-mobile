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
import { BluetoothProvider } from "./src/hooks/bluetooth";
import { HeartBeat } from "./src/databases/schemas/HeartBeat";
import { Position } from "./src/databases/schemas/Position";
import { Login } from "./src/screens/Public/Login";
import { LoadingIndicator } from "./src/screens/Public/LoadingIndicator";

export default function App() {
  return (
    <AppProvider id={"olivia-yeuiz"} baseUrl="https://realm.mongodb.com">
      <ThemeProvider theme={light}>
        <StatusBar backgroundColor={"#855EE0"} />
        <AuthProvider>
          <BluetoothProvider>
            <NavigationContainer>
              <UserProvider fallback={Login}>
                <RealmProvider
                  sync={{
                    flexible: true,
                    onError: (_, error) => {
                      // Show sync errors in the console
                      console.error(error);
                    },
                    initialSubscriptions: {
                      update(subs, realm) {
                        subs.add(realm.objects(HeartBeat));
                        subs.add(realm.objects(Position));
                      },
                    },
                  }}
                  schema={[HeartBeat, Position]}
                  fallback={LoadingIndicator}
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
