/* eslint-disable no-bitwise */
import { useCallback, useEffect, useMemo, useState } from "react";
import { PermissionsAndroid, Platform, Alert } from "react-native";
import {
  BleError,
  Characteristic,
  Device,
  NativeDevice,
} from "react-native-ble-plx";
import Realm from "realm";
import * as Notifications from "expo-notifications";

import * as ExpoDevice from "expo-device";

import base64 from "react-native-base64";
import { useRealm } from "../../hooks/realm";
import realmManager from "../realm/manager";
import { useAuth } from "../../hooks/auth";
import { useBluetooth } from "../../hooks/bluetooth";

const HEART_RATE_UUID = "0000180d-0000-1000-8000-00805f9b34fb";
const HEART_RATE_CHARACTERISTIC = "00002a37-0000-1000-8000-00805f9b34fb";
import bluetoothManager from "./manager";
import userManager from "../user/manager";

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

function useBLE(): BluetoothLowEnergyApi {
  const { user } = useAuth();
  const { dispatch } = useBluetooth();
  const realm = useRealm();

  const bleManager = bluetoothManager.getBleManager();

  const [allDevices, setAllDevices] = useState<Device[]>([]);

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
            title: "Permissão de localização",
            message: "Bluetooth Low Energy(BLE) precisa da localização",
            buttonPositive: "OK",
          }
        );

        const fineLocationBackgourndPermission =
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
            {
              title: "Permissão de Localização em segundo plano",
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

          const deviceConnected = await bleManager.connectToDevice(device.id, {
            autoConnect: true,
          });

          await deviceConnected.discoverAllServicesAndCharacteristics();

          bleManager.stopDeviceScan();

          dispatch({
            type: "SET_DEVICE",
            payload: deviceConnected,
          });

          dispatch({
            type: "SET_CONNECTED",
            payload: true,
          });

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

        if (connected) {
          bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
              console.log(error);
            }
          });

          await device.discoverAllServicesAndCharacteristics();

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

        if (connected) {
          bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
              console.log(error);
            }
          });

          await device.discoverAllServicesAndCharacteristics();

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
      });
    } else {
      dispatch({
        type: "SET_CONNECTED",
        payload: false,
      });
    }
  };

  const onHeartRateUpdate = useCallback(
    async (error: BleError | null, characteristic: Characteristic | null) => {
      if (error) {
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
        try {
          if (error.message.match("disconnected")) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Dispositivo Desconectado",
                body: "A pulseria desconectou do aplicativo, acesse o aplicativo e reinicie a conexão para continuar o monitoramento",
              },
              trigger: null,
            });
          }
          if (!realm.isClosed) {
            realm.write(async () => {
              realm.create("LogErrors", {
                _id: new Realm.BSON.ObjectId(),
                user_id: new Realm.BSON.ObjectId(user?._id),
                type: error.message,
                created_at: new Date(),
              });
            });
          } else {
            realmManager
              .getRealmInstance()
              .then((realmInstance) => {
                const userInstance = userManager.getUser();

                if (realmInstance && userInstance) {
                  realmInstance.write(async () => {
                    realmInstance.create("LogErrors", {
                      _id: new Realm.BSON.ObjectId(),
                      user_id: new Realm.BSON.ObjectId(userInstance._id),
                      type: error.message,
                      created_at: new Date(),
                    });
                  });
                }
              })
              .catch((err: any) => {
                console.log("Error To Reopen: ", err);
              });
          }
        } catch (e) {
          console.log("BLE Error:", e);
        }

        return;
      } else if (!characteristic?.value) {
        Alert.alert(
          "Erro ao ler o BPM",
          "Aconteceu um erro ao ler o BPM, tente reiniciar sua conexão com o dispositivo",
          [{ text: "OK", onPress: () => {} }]
        );
        try {
          if (!realm.isClosed) {
            realm.write(async () => {
              realm.create("LogErrors", {
                _id: new Realm.BSON.ObjectId(),
                user_id: new Realm.BSON.ObjectId(user?._id),
                type: "BLE Error",
                created_at: new Date(),
              });
            });
          } else {
            realmManager
              .getRealmInstance()
              .then((realmInstance) => {
                const userInstance = userManager.getUser();

                if (realmInstance && userInstance) {
                  realmInstance.write(async () => {
                    realmInstance.create("LogErrors", {
                      _id: new Realm.BSON.ObjectId(),
                      user_id: new Realm.BSON.ObjectId(userInstance._id),
                      type: "BLE Error",
                      created_at: new Date(),
                    });
                  });
                }
              })
              .catch((err: any) => {
                console.log("Error To Reopen: ", err);
              });
          }
        } catch (e) {
          console.log("BLE Error:", e);
        }
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

      const data = {
        heart_rate: innerHeartRate,
        created_at: new Date(),
      };

      try {
        if (!realm.isClosed) {
          realm.write(async () => {
            realm.create("HeartBeats", {
              _id: new Realm.BSON.ObjectId(),
              user_id: new Realm.BSON.ObjectId(user?._id),
              heart_rate: data.heart_rate,
              created_at: data.created_at,
            });
          });
        } else {
          const realmInstance = await realmManager.getRealmInstance();
          const userInstance = userManager.getUser();

          if (realmInstance && userInstance) {
            realmInstance.write(async () => {
              realmInstance.create("HeartBeats", {
                _id: new Realm.BSON.ObjectId(),
                user_id: new Realm.BSON.ObjectId(userInstance._id),
                heart_rate: data.heart_rate,
                created_at: data.created_at,
              });
            });
          }
        }
      } catch (e) {
        console.log("Error To Insert:", e);
      }
    },
    [realm, user]
  );

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

      device.onDisconnected((error, device) => {
        if (error) {
          try {
            Notifications.scheduleNotificationAsync({
              content: {
                title: "Dispositivo Desconectado",
                body: "A pulseria desconectou do aplicativo, acesse o aplicativo e reinicie a conexão para continuar o monitoramento",
              },
              trigger: null,
            });
            if (!realm.isClosed) {
              realm.write(async () => {
                realm.create("LogErrors", {
                  _id: new Realm.BSON.ObjectId(),
                  user_id: new Realm.BSON.ObjectId(user?._id),
                  type: "Device Disconnected",
                  created_at: new Date(),
                });
              });
            } else {
              realmManager
                .getRealmInstance()
                .then((realmInstance) => {
                  const userInstance = userManager.getUser();

                  if (realmInstance && userInstance) {
                    realmInstance.write(async () => {
                      realmInstance.create("LogErrors", {
                        _id: new Realm.BSON.ObjectId(),
                        user_id: new Realm.BSON.ObjectId(userInstance._id),
                        type: "Device Disconnected",
                        created_at: new Date(),
                      });
                    });
                  }
                })
                .catch((err: any) => {
                  console.log("Error To Reopen: ", err);
                });
            }
          } catch (e) {
            console.log("Error: ", error);
          }
        }
        dispatch({
          type: "SET_CONNECTED",
          payload: false,
        });
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

const onHeartRateUpdate = async (
  error: BleError | null,
  characteristic: Characteristic | null
) => {
  if (error) {
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
    try {
      if (error.message.match("disconnected")) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Dispositivo Desconectado",
            body: "A pulseria desconectou do aplicativo, acesse o aplicativo e reinicie a conexão para continuar o monitoramento",
          },
          trigger: null,
        });
      }
      const realmInstance = await realmManager.getRealmInstance();
      const userInstance = userManager.getUser();

      if (realmInstance && userInstance) {
        realmInstance.write(async () => {
          realmInstance.create("LogErrors", {
            _id: new Realm.BSON.ObjectId(),
            user_id: new Realm.BSON.ObjectId(userInstance._id),
            type: error.message,
            created_at: new Date(),
          });
        });
      }
    } catch (e) {
      console.log("BLE Error:", e);
    }
    return;
  } else if (!characteristic?.value) {
    Alert.alert(
      "Erro ao ler o BPM",
      "Aconteceu um erro ao ler o BPM, tente reiniciar sua conexão com o dispositivo",
      [{ text: "OK", onPress: () => {} }]
    );
    try {
      const realmInstance = await realmManager.getRealmInstance();
      const userInstance = userManager.getUser();

      if (realmInstance && userInstance) {
        realmInstance.write(async () => {
          realmInstance.create("LogErrors", {
            _id: new Realm.BSON.ObjectId(),
            user_id: new Realm.BSON.ObjectId(userInstance._id),
            type: "BLE Error",
            created_at: new Date(),
          });
        });
      }
    } catch (e) {
      console.log("BLE Error:", e);
    }
    return;
  }

  const rawData = base64.decode(characteristic.value);
  let innerHeartRate: number = -1;

  const firstBitValue: number = Number(rawData) & 0x01;

  if (firstBitValue === 0) {
    innerHeartRate = rawData[1].charCodeAt(0);
  } else {
    innerHeartRate =
      Number(rawData[1].charCodeAt(0) << 8) + Number(rawData[2].charCodeAt(2));
  }

  const data = {
    heart_rate: innerHeartRate,
    created_at: new Date(),
  };

  try {
    const realmInstance = await realmManager.getRealmInstance();
    const userInstance = userManager.getUser();

    if (realmInstance && userInstance) {
      realmInstance.write(async () => {
        realmInstance.create("HeartBeats", {
          _id: new Realm.BSON.ObjectId(),
          user_id: new Realm.BSON.ObjectId(userInstance._id),
          heart_rate: data.heart_rate,
          created_at: data.created_at,
        });
      });
    }
  } catch (e) {
    console.log("Error To Insert (background):", e);
  }
};

const startStreamingData = (device: Device) => {
  if (device) {
    const subscription = device.monitorCharacteristicForService(
      HEART_RATE_UUID,
      HEART_RATE_CHARACTERISTIC,
      onHeartRateUpdate
    );

    device.onDisconnected((error, device) => {
      if (error) {
        try {
          Notifications.scheduleNotificationAsync({
            content: {
              title: "Dispositivo Desconectado",
              body: "A pulseria desconectou do aplicativo, acesse o aplicativo e reinicie a conexão para continuar o monitoramento",
            },
            trigger: null,
          });
          realmManager
            .getRealmInstance()
            .then((realmInstance) => {
              const userInstance = userManager.getUser();

              if (realmInstance && userInstance) {
                realmInstance.write(async () => {
                  realmInstance.create("LogErrors", {
                    _id: new Realm.BSON.ObjectId(),
                    user_id: new Realm.BSON.ObjectId(userInstance._id),
                    type: "Device Disconnected",
                    created_at: new Date(),
                  });
                });
              }
            })
            .catch((err: any) => {
              console.log("Error: ", err);
            });
        } catch (e) {
          console.log("Error: ", error);
        }
      }
    });

    return subscription;
  }

  return null;
};
const connectToDeviceWithRetry = (max_attempt: number = 5) => {
  let attempt = 0;

  return async function createConnection(device: Device) {
    const bleManager = bluetoothManager.getBleManager();
    try {
      const isConnected = await device.isConnected();

      if (!isConnected) {
        bleManager.startDeviceScan(null, null, (error, device) => {
          if (error) {
            console.log(error);
          }
        });

        const deviceConnected = await bleManager.connectToDevice(device.id, {
          autoConnect: true,
        });

        await deviceConnected.discoverAllServicesAndCharacteristics();

        bleManager.stopDeviceScan();

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

const createDevice = (device: NativeDevice) => {
  const bleManager = bluetoothManager.getBleManager();
  const newDevice = new Device(device, bleManager);

  return newDevice;
};
export { connectToDevice, createDevice };

export default useBLE;
