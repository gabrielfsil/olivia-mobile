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

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): Promise<boolean>;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  startStreamingData: (device: Device) => Promise<any>;
  listServices: (device: Device) => Promise<any>;
  connectedDevice: Device | null;
  allDevices: Device[];
}

function useBLE(): BluetoothLowEnergyApi {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
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
        
        bleManager
          .connectToDevice(device.id, {
            autoConnect: true,
          })
          .then((device) => {
            console.log("CONNECTED");
            bleManager.stopDeviceScan();
            setConnectedDevice(device);
            return;
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

  const listServices = async (device: Device) => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
    });
    setTimeout(() => {
      device.discoverAllServicesAndCharacteristics().then(async (device) => {
        console.log("DISCOVERED ALL SERVICES AND CHARACTERISTICS");
        bleManager.stopDeviceScan();
        const services = await device.services();
        console.log("SERVICES", services);
        return services;
      });
    }, 3000);
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      subscription?.remove();
      connectedDevice.cancelConnection().then(() => {
        setConnectedDevice(null);
        console.log("DISCONNECTED");
      });
    }
  };

  const checkConnectionStatus = async () => {
    if (connectedDevice) {
      const isConnected = await connectedDevice.isConnected();
      console.log("isConnected: ", isConnected);
      return isConnected ? connectedDevice : null;
    }
    return null;
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
            onPress: () => {
              checkConnectionStatus().then((device) => {
                if (device) {
                  console.log("Connection is still alive");
                  subscription?.remove();
                  startStreamingData(device);
                } else {
                  console.log("Connection is dead");
                  disconnectFromDevice();
                }
              });
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
  };

  const startStreamingData = async (device: Device) => {
    if (device) {
      const isConnected = await device.isConnected();
      if (isConnected) {
        const subs = device.monitorCharacteristicForService(
          HEART_RATE_UUID,
          HEART_RATE_CHARACTERISTIC,
          onHeartRateUpdate
        );

        device.onDisconnected((error, device) => {
          if (error) {
            console.log("Error: ", error);
          }

          console.log("Disconnected from device");
          subs.remove();
          setConnectedDevice(null);
          checkConnectionStatus()
            .then((isConnected) => {
              if (!isConnected) {
                connectToDevice(device)
                  .then(() => {
                    console.log("Connection recreated");
                  })
                  .catch((err) => {
                    console.log("Failed to recreate connection");
                    console.log(err);
                  });
              }
            })
            .catch((err) => {
              console.log(err);
            });
        });
        if (subscription) {
          subscription.remove();
        }
        setSubscription(subs);
        return subs;
      } else {
        scanForPeripherals()
          .then((status) => {
            if (status) {
              connectToDevice(device)
                .then(() => {
                  console.log("Connection recreated");
                })
                .catch((err) => {
                  console.log("Failed to recreate connection");
                  console.log(err);
                });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    } else {
      console.log("No Device Connected");
      setConnectedDevice(null);
    }
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
  };
}

export default useBLE;
