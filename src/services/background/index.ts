import useBLE from "../ble";
import useLocation from "../location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@realm/react";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";

const BACKGROUND_FETCH_TASK = "BackgroundServiceConnectionAndMonitoring";

const backgroundServiceConnectionAndMonitoring = async () => {
  console.log("Função rodando em background");
  const { connectToDevice, createDevice } = useBLE();

  const { monitorLocation } = useLocation();

  const user = useUser();
  console.log(user);
  if (user) {
    await user.refreshCustomData();

    const deviceStorage = await AsyncStorage.getItem("@olivia:device");

    if (deviceStorage) {
      const device = createDevice(JSON.parse(deviceStorage));
      if (device) {
        console.log("Reconnecting to device...");
        await connectToDevice(device);
      }
    }

    monitorLocation();
  }
};

TaskManager.defineTask(BACKGROUND_FETCH_TASK, ({ data, error }) => {
  if (error) {
    console.log(error);
    return;
  }
  console.log(data);
  backgroundServiceConnectionAndMonitoring();
});

export async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}

// // Configure o serviço em segundo plano
// BackgroundFetch.configure(
//   {
//     minimumFetchInterval: 15, // Intervalo mínimo em minutos
//     stopOnTerminate: false, // Continue executando após o aplicativo ser fechado
//     startOnBoot: true, // Inicie automaticamente após a reinicialização do dispositivo
//   },
//   async (taskId) => {
//     // Lógica a ser executada em segundo plano
//     // Certifique-se de que isso seja uma operação leve para não sobrecarregar o dispositivo
//     // taskId é um identificador exclusivo para a tarefa em segundo plano
//     const { connectToDevice, createDevice } = useBLE();

//     const { monitorLocation } = useLocation();

//     const user = useUser();
//     console.log(user);
//     if (user) {
//       await user.refreshCustomData();

//       const deviceStorage = await AsyncStorage.getItem("@olivia:device");

//       if (deviceStorage) {
//         const device = createDevice(JSON.parse(deviceStorage));
//         if (device) {
//           console.log("Reconnecting to device...");
//           await connectToDevice(device);
//         }
//       }

//       monitorLocation();
//     }
//   },
//   (error) => {
//     console.log("[BackgroundFetch] Erro:", error);
//   }
// );

// // Para começar
// BackgroundFetch.start();
