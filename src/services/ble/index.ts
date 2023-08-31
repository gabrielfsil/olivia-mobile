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

const HEART_RATE_UUID = "0000180d-0000-1000-8000-00805f9b34fb";
const HEART_RATE_CHARACTERISTIC = "00002a37-0000-1000-8000-00805f9b34fb";

const HEART_RATE_TRANSACTION = "heart_rate";

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): Promise<boolean>;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  startStreamingData: (device: Device) => Promise<any>;
  connectedDevice: Device | null;
  allDevices: Device[];
  heartRate: number;
}

function useBLE(): BluetoothLowEnergyApi {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [heartRate, setHeartRate] = useState<number>(0);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

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

  const connectToDevice = async (device: Device) => {
    try {
      if (!connectedDevice) {
        // const deviceConnection = await bleManager.connectToDevice(device.id);

        // setConnectedDevice(deviceConnection);

        // await deviceConnection.discoverAllServicesAndCharacteristics();

        // await deviceConnection.services();

        // bleManager.stopDeviceScan();

        // const subscription = await startStreamingData(deviceConnection);

        // console.log(subscription);
        device
          .connect({
            autoConnect: true,
            timeout: 100000,
          })
          .then((device) => {
            setConnectedDevice(device);
            console.log("CONNECTED");
            return device.discoverAllServicesAndCharacteristics();
          })
          .then(async (device) => {
            console.log("DISCOVERED ALL SERVICES AND CHARACTERISTICS");
            console.log(await device.services());
            return startStreamingData(device);
          })
          .then((sub) => {
            console.log("START STREAMING DATA");
            setSubscription(sub ? sub : null);
          })
          .catch((e) => {
            console.log("FAILED TO CONNECT", e);
          });
      }
    } catch (e) {
      console.log("FAILED TO CONNECT", e);
      await connectToDevice(device);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      subscription?.remove();
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setHeartRate(0);
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
        [{ text: "OK", onPress: () => {} }]
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
    setHeartRate(innerHeartRate);
  };

  const startStreamingData = async (device: Device) => {
    if (device) {
      const isConnected = await device.isConnected();
      if (isConnected) {
        const subscription = device.monitorCharacteristicForService(
          HEART_RATE_UUID,
          HEART_RATE_CHARACTERISTIC,
          onHeartRateUpdate
        );

        device.onDisconnected((error, device) => {
          if (error) {
            console.log("Error: ", error);
            return;
          }
          console.log("Disconnected from device");
          subscription.remove();
          connectToDevice(device);
        });

        return subscription;
      } else {
        await scanForPeripherals();
        await connectToDevice(device);
      }
    } else {
      console.log("No Device Connected");
      setConnectedDevice(null);
    }
  };

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    heartRate,
    startStreamingData,
  };
}

export default useBLE;
