/* eslint-disable no-bitwise */
import { useEffect, useMemo, useState } from "react";
import { PermissionsAndroid, Platform, Alert } from "react-native";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
  NativeDevice,
} from "react-native-ble-plx";
import Realm from "realm";

import * as ExpoDevice from "expo-device";

import base64 from "react-native-base64";
import { useRealm } from "../../hooks/realm";
import { useAuth } from "../../hooks/auth";
import { useBluetooth } from "../../hooks/bluetooth";
import { HeartBeat } from "../../databases/schemas/HeartBeat";

const HEART_RATE_UUID = "0000180d-0000-1000-8000-00805f9b34fb";
const HEART_RATE_CHARACTERISTIC = "00002a37-0000-1000-8000-00805f9b34fb";

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): Promise<boolean>;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: (device: Device) => Promise<void>;
  startStreamingData: (device: Device) => any;
  listServices: (device: Device) => Promise<any>;
  listCharacteristics: (device: Device, service: string) => Promise<any>;
  allDevices: Device[];
  createDevice(device: NativeDevice): Device;
}

function maxBackoffJitter(attempt: number) {
  const BASE = 2000;
  const MAX_DELAY = 10000;
  const exponential = Math.pow(2, attempt) * BASE;
  const delay = Math.min(exponential, MAX_DELAY);
  return Math.floor(Math.random() * delay);
}

interface HeartRate {
  value: number;
  timestamp: Date;
}

function useBLE(): BluetoothLowEnergyApi {
  const { user } = useAuth();
  const { dispatch } = useBluetooth();

  const [heartRate, setHeartRate] = useState<HeartRate>({
    value: -1,
    timestamp: new Date(),
  });

  const realm = useRealm();


  const bleManager = useMemo(() => new BleManager(), []);

  const [allDevices, setAllDevices] = useState<Device[]>([]);

  useEffect(() => {
    console.log(heartRate);
    if (heartRate.value > 0) {
      realm.write(() => {
        realm.create("HeartBeats", {
          _id: new Realm.BSON.ObjectId(),
          user_id: new Realm.BSON.ObjectId(user?._id),
          heart_rate: heartRate.value,
          created_at: heartRate.timestamp,
        });
      });
    }
  }, [heartRate, realm, user]);

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
            message: "Bluetooth Low Energy(BLE) precisa da localização",
            buttonPositive: "OK",
          }
        );

        const fineLocationBackgourndPermission =
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            {
              title: "Background Location Permission",
              message:
                "A olivia precisa de acesso a localização em segundo plano",
              buttonPositive: "OK",
            }
          );

        return (
          fineLocationBackgourndPermission ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return false;
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
        const isConnected = await device.isConnected();

        if (!isConnected) {
          bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
              console.log(error);
            }
          });

          console.log("Connecting to device");
          const deviceConnected = await bleManager.connectToDevice(device.id, {
            autoConnect: true,
          });

          await deviceConnected.discoverAllServicesAndCharacteristics();

          console.log("DISCOVERED ALL SERVICES AND CHARACTERISTICS");

          bleManager.stopDeviceScan();

          dispatch({
            type: "SET_DEVICE",
            payload: deviceConnected,
          });

          dispatch({
            type: "SET_CONNECTED",
            payload: true,
          });

          console.log("Connected to device");

          await new Promise((resolve) => setTimeout(resolve, 3000));

          startStreamingData(deviceConnected);
        }
      } catch (e) {
        bleManager.stopDeviceScan();
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
          dispatch({
            type: "SET_CONNECTED",
            payload: false,
          });

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

    return async function getCharacteristcs(device: Device, service: string) {
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

          const characteristics = await device.characteristicsForService(
            service
          );

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
          return getCharacteristcs(device, service);
        }
      }
    };
  };

  const listCharacteristics = async (
    device: Device,
    service: string
  ): Promise<any> => {
    const getServices = listCharacteristcsWithRetry(5);

    const services = await getServices(device, service);

    return services;
  };

  const disconnectFromDevice = async (device: Device) => {
    const isConnected = await device.isConnected();

    if (isConnected) {
      device.cancelConnection().then(() => {
        dispatch({
          type: "SET_CONNECTED",
          payload: false,
        });
        console.log("DISCONNECTED");
      });
    } else {
      dispatch({
        type: "SET_CONNECTED",
        payload: false,
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
        "Aconteceu um erro ao ler o BPM, desconecte e conecte o dispositivo novamente",
        [
          {
            text: "Ok",
            onPress: () => {},
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

    setHeartRate({
      timestamp: new Date(),
      value: innerHeartRate,
    });
  };

  const startStreamingData = (device: Device) => {
    if (device) {
      const subscription = device.monitorCharacteristicForService(
        HEART_RATE_UUID,
        HEART_RATE_CHARACTERISTIC,
        onHeartRateUpdate
      );

      dispatch({
        type: "SET_SUBSCRIPTION",
        payload: subscription,
      });

      console.log("Started monitoring heart rate");

      device.onDisconnected((error, device) => {
        if (error) {
          console.log("Error: ", error);
        }
        dispatch({
          type: "SET_CONNECTED",
          payload: false,
        });

        console.log("Disconnected from device");
      });

      return subscription;
    }

    return null;
  };

  const createDevice = (device: NativeDevice) => {
    const newDevice = new Device(device, bleManager);

    return newDevice;
  };

  return {
    createDevice,
    scanForPeripherals,
    listServices,
    requestPermissions,
    connectToDevice,
    allDevices,
    disconnectFromDevice,
    startStreamingData,
    listCharacteristics,
  };
}

export default useBLE;
