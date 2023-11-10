import NetInfo from "@react-native-community/netinfo";
import useBLE from "../ble";
import useLocation from "../location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@realm/react";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from 'expo-background-fetch';

const BACKGROUND_FETCH_TASK = "BackgroundServiceConnectionAndMonitoring";

const backgroundServiceConnectionAndMonitoring = async () => {
  console.log("Função rodando em background");
  try {
    const { connectToDevice, createDevice } = useBLE();

    const { monitorLocation } = useLocation();

    const user = useUser();

    if (user) {
      const state = await NetInfo.fetch();

      if (state.isConnected) {
        await user.refreshCustomData();
      }
    }

    const deviceStorage = await AsyncStorage.getItem("@olivia:device");

    if (deviceStorage) {
      const device = createDevice(JSON.parse(deviceStorage));
      if (device) {
        console.log("Reconnecting to device...");
        await connectToDevice(device);
      }
    }

    monitorLocation();
  } catch (err) {
    console.log(err);
  }
};

TaskManager.defineTask(BACKGROUND_FETCH_TASK, ({ data, error }) => {
  if (error) {
    console.log(error);
    return;
  }
  backgroundServiceConnectionAndMonitoring();
});


export async function registerBackgroundFetchAsync() {

  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 15,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}
