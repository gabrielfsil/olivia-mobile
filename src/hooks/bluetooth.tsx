import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useReducer, useContext } from "react";
import { Device, Subscription } from "react-native-ble-plx";

interface BluetoothProviderProps {
  children: React.ReactNode;
}

interface BluetoothState {
  isConnected: boolean;
  device: Device | null;
  subscription: Subscription | null;
}

interface BluetoothContextProps {
  state: BluetoothState;
  dispatch: React.Dispatch<any>;
}

const BluetoothContext = createContext<BluetoothContextProps>(
  {} as BluetoothContextProps
);

const BluetoothProvider = ({ children }: BluetoothProviderProps) => {
  const initialState = {
    isConnected: false,
    device: null,
    subscription: null,
  } as BluetoothState;

  const updateDeviceStorage = async (device: string) => {
    try {
      await AsyncStorage.setItem("@olivia:device", JSON.stringify(device));
    } catch (error) {
      console.log(error);
    }
  };

  const reducer: React.Reducer<BluetoothState, any> = (state, action) => {
    switch (action.type) {
      case "SET_CONNECTED":
        return { ...state, isConnected: action.payload };
      case "SET_DEVICE":
        updateDeviceStorage(action.payload);
        return { ...state, device: action.payload };
      case "SET_SUBSCRIPTION":
        return { ...state, subscription: action.payload };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <BluetoothContext.Provider value={{ state, dispatch }}>
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => {
  return useContext(BluetoothContext);
};

export { BluetoothProvider };
