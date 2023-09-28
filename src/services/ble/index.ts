/* eslint-disable no-bitwise */
import { useCallback, useMemo, useState } from "react";
import { PermissionsAndroid, Platform, Alert } from "react-native";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
  Subscription,
} from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";

import base64 from "react-native-base64";
import { useRealm } from "../../hooks/realm";
import { useAuth } from "../../hooks/auth";

const HEART_RATE_UUID = "0000180d-0000-1000-8000-00805f9b34fb";
const HEART_RATE_CHARACTERISTIC = "00002a37-0000-1000-8000-00805f9b34fb";

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): Promise<boolean>;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  startStreamingData: (device: Device) => any;
  listServices: (device: Device) => Promise<any>;
  listCharacteristics: (device: Device,service: string) => Promise<any>;
  connectedDevice: Device | null;
  allDevices: Device[];
}

function maxBackoffJitter(attempt: number) {
  const BASE = 2000;
  const MAX_DELAY = 10000;
  const exponential = Math.pow(2, attempt) * BASE;
  const delay = Math.min(exponential, MAX_DELAY);
  return Math.floor(Math.random() * delay);
}

function useBLE(): BluetoothLowEnergyApi {
  const realm = useRealm();
  const { user, device } = useAuth();

  const bleManager = useMemo(() => new BleManager(), []);

  const [allDevices, setAllDevices] = useState<Device[]>([]);

  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const fineLocationBackgourndPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted" &&
      fineLocationBackgourndPermission === "granted"
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = async () => {
    const state = await bleManager.state();

    if (state !== "PoweredOn") {
      Alert.alert(
        "Bluetooth Desativado",
        "O bluetooth precisa ficar ligado para que os dados coletados no dispositivo possam ser coletados",
        [{ text: "OK", onPress: () => {} }]
      );
      return false;
    }

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device && device.name !== null) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

    return true;
  };

  const connectToDeviceWithRetry = (max_attempt: number = 5) => {
    let attempt = 0;

    return async function createConnection(device: Device) {
      try {
        if (!connectedDevice) {
          console.log("Connecting to device");
          const deviceConnected = await bleManager.connectToDevice(device.id, {
            autoConnect: true,
          });

          await device.discoverAllServicesAndCharacteristics();

          console.log("DISCOVERED ALL SERVICES AND CHARACTERISTICS");

          bleManager.stopDeviceScan();

          setConnectedDevice(deviceConnected);

          console.log("Connected to device");

          await new Promise((resolve) => setTimeout(resolve, 3000));

          startStreamingData(deviceConnected);
        }
      } catch (e) {
        if (attempt < max_attempt) {
          attempt += 1;
          const delay = maxBackoffJitter(attempt);
          console.warn(
            `Request failed to connect. Retry attempt ${attempt} after ${delay}ms`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return createConnection(device);
        }
      }
    };
  };

  const connectToDevice = async (device: Device) => {
    const createConnection = connectToDeviceWithRetry(8);

    await createConnection(device);
  };

  const listServicesWithRetry = (max_attempt: number = 5) => {
    let attempt = 0;

    return async function getServices(device: Device) {
      try {
        const connected = await device.isConnected();

        console.log("CONNECTED: ", connected);

        if (connected) {
          bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
              console.log(error);
            }
          });

          await device.discoverAllServicesAndCharacteristics();

          console.log("DISCOVERED ALL SERVICES AND CHARACTERISTICS");

          const services = await device.services();

          bleManager.stopDeviceScan();

          return services;
        } else {
          await connectToDevice(device);

          throw new Error();
        }
      } catch (e) {
        if (attempt < max_attempt) {
          attempt += 1;
          const delay = maxBackoffJitter(attempt);
          console.warn(
            `Request failed to list services. Retry attempt ${attempt} after ${delay}ms`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return getServices(device);
        }
      }
    };
  };

  const listServices = async (device: Device): Promise<any> => {
    const getServices = listServicesWithRetry(5);

    const services = await getServices(device);

    return services;
  };

  const listCharacteristcsWithRetry = (max_attempt: number = 5) => {
    let attempt = 0;

    return async function getCharacteristcs(device: Device,service:string) {
      try {
        const connected = await device.isConnected();

        console.log("CONNECTED: ", connected);

        if (connected) {
          bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
              console.log(error);
            }
          });

          await device.discoverAllServicesAndCharacteristics();

          console.log("DISCOVERED ALL SERVICES AND CHARACTERISTICS");

          const characteristics = await device.characteristicsForService(service);

          bleManager.stopDeviceScan();

          return characteristics;
        } else {
          await connectToDevice(device);

          throw new Error();
        }
      } catch (e) {
        if (attempt < max_attempt) {
          attempt += 1;
          const delay = maxBackoffJitter(attempt);
          console.warn(
            `Request failed to list services. Retry attempt ${attempt} after ${delay}ms`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return getCharacteristcs(device,service);
        }
      }
    };
  };

  const listCharacteristics = async (device: Device, service: string): Promise<any> => {
    const getServices = listCharacteristcsWithRetry(5);

    const services = await getServices(device,service);

    return services;
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      connectedDevice.cancelConnection().then(() => {
        setConnectedDevice(null);
        console.log("DISCONNECTED");
      });
    }
  };

  const onHeartRateUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log(error);
      Alert.alert(
        "Erro ao ler o BPM",
        "Aconteceu um erro ao ler o BPM, tente reiniciar sua conexão com o dispositivo",
        [
          {
            text: "OK",
            onPress: async () => {
              console.log(connectedDevice);
              if (connectedDevice) {
                await connectToDevice(connectedDevice);
              }
            },
          },
        ]
      );
      return;
    } else if (!characteristic?.value) {
      console.log("No Data was recieved");
      Alert.alert(
        "Erro ao ler o BPM",
        "Aconteceu um erro ao ler o BPM, tente reiniciar sua conexão com o dispositivo",
        [{ text: "OK", onPress: () => {} }]
      );
      return;
    }

    const rawData = base64.decode(characteristic.value);
    let innerHeartRate: number = -1;

    const firstBitValue: number = Number(rawData) & 0x01;

    if (firstBitValue === 0) {
      innerHeartRate = rawData[1].charCodeAt(0);
    } else {
      innerHeartRate =
        Number(rawData[1].charCodeAt(0) << 8) +
        Number(rawData[2].charCodeAt(2));
    }

    console.log("Heart Rate: ", innerHeartRate);
    console.log("Timestamp: ", new Date());

    realm.write(() => {
      realm.create("HeartRate", {
        user_id: user?._id,
        heart_rate: innerHeartRate,
        created_at: new Date(),
      });
    });
  };

  const heartRateMonitorWithRetry = (
    max_attempt: number = 5,
    device: Device
  ) => {
    let attempt = 0;

    return async function monitorHeartRate(
      error: BleError | null,
      characteristic: Characteristic | null
    ) {
      if (error) {
        if (attempt < max_attempt) {
          attempt += 1;
          const delay = maxBackoffJitter(attempt);
          console.warn(
            `Request failed to monitor heart rate. Retry attempt ${attempt} after ${delay}ms`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          startStreamingData(device);
        }
      } else if (characteristic) {
        onHeartRateUpdate(error, characteristic);
      }
    };
  };

  const startStreamingData = (device: Device): Subscription => {
    const subscription = device.monitorCharacteristicForService(
      HEART_RATE_UUID,
      HEART_RATE_CHARACTERISTIC,
      onHeartRateUpdate
    );

    device.onDisconnected((error, device) => {
      if (error) {
        console.log("Error: ", error);
      }

      console.log("Disconnected from device");
    });

    return subscription;
  };

  return {
    scanForPeripherals,
    listServices,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    startStreamingData,
    listCharacteristics
  };
}

export default useBLE;
