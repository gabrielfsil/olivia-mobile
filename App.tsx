import Realm from "realm";
Realm.flags.THROW_ON_GLOBAL_REALM = true;
import { ThemeProvider } from "styled-components/native";
import light from "./src/theme/light";
import { Routes } from "./src/Routes";
import { StatusBar } from "react-native";
import { AuthProvider } from "./src/hooks/auth";
import { RealmProvider } from "./src/hooks/realm";
import { AppProvider, UserProvider } from "@realm/react";
import { NavigationContainer } from "@react-navigation/native";
import { BluetoothProvider } from "./src/hooks/bluetooth";
import { HeartBeat } from "./src/databases/schemas/HeartBeat";
import { Position } from "./src/databases/schemas/Position";
import { Login } from "./src/screens/Public/Login";
import { LoadingIndicator } from "./src/screens/Public/LoadingIndicator";
import { LogError } from "./src/databases/schemas/LogError";
import "./src/services/background";
import "./src/services/notification";
import { realmConfig } from "./src/databases";
import { Execution } from "./src/databases/schemas/Execution";

export default function App() {

  return (
    <AppProvider id={"olivia-yeuiz"} baseUrl="https://realm.mongodb.com">
      <ThemeProvider theme={light}>
        <StatusBar backgroundColor={"#855EE0"} />
        <AuthProvider>
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
                      subs.add(realm.objects(LogError));
                      subs.add(realm.objects(Execution));
                    },
                  },
                }}
                schema={realmConfig.schema}
                schemaVersion={realmConfig.schemaVersion}
                fallback={LoadingIndicator}
              >
                <BluetoothProvider>
                  <Routes />
                </BluetoothProvider>
              </RealmProvider>
            </UserProvider>
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </AppProvider>
  );
}
