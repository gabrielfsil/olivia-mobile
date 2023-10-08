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
import { useEffect } from "react";
import * as TaskManager from "expo-task-manager";
import "./src/services/background";

export default function App() {
  useEffect(() => {
    TaskManager.isTaskRegisteredAsync(
      "backgroundServiceConnectionAndMonitoring"
    ).then((registered) => {
      if (!registered) {
        console.log(
          "Tarefa de conexão e monitoramento em segundo plano não foi registrada"
        );
      } else {
        console.log(
          "Tarefa de conexão e monitoramento em segundo plano está registrada com sucesso"
        );
      }
    });
  }, []);
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
                    },
                  },
                }}
                schema={[HeartBeat, Position]}
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
