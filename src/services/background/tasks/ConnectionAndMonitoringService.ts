import NetInfo from "@react-native-community/netinfo";
import { connectToDevice, createDevice } from "../../ble";
import AsyncStorage from "@react-native-async-storage/async-storage";
import realmManager from "../../realm/manager";

const connectionAndMonitoringService = async () => {
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

export { connectionAndMonitoringService };
