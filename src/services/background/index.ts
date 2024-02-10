import NetInfo from "@react-native-community/netinfo";
import { connectToDevice, createDevice } from "../ble";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import realmManager from "../realm/manager";

const BACKGROUND_FETCH_TASK = "BackgroundServiceConnectionAndMonitoring";

const backgroundServiceConnectionAndMonitoring = async () => {
 
  const state = await NetInfo.fetch();

  if (state.isConnected) {
    await realmManager.refreshToken();

    await realmManager.syncData();
  }

  const deviceStorage = await AsyncStorage.getItem("@olivia:device");

  if (deviceStorage) {
    const device = createDevice(JSON.parse(deviceStorage));

    if (device) {
      const connected = await device.isConnected();

      if (!connected) {
        await connectToDevice(device);
      }
    }
  }
};

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    await backgroundServiceConnectionAndMonitoring();

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 5,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

export async function checkStatusAsync() {
  
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_FETCH_TASK
  );

  await TaskManager.getRegisteredTasksAsync();

  if (!isRegistered) {
    await registerBackgroundFetchAsync();
  } 
}
