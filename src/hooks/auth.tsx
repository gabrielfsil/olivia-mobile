import React, { createContext, useContext, useEffect, useState } from "react";
import { Device } from "react-native-ble-plx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import userManager from "../services/user/manager";
import realmManager from "../services/realm/manager";
interface AuthProviderProps {
  children: React.ReactNode;
}

interface User {
  _id: string;
  name: string;
  email: string;
  permission: number;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  device: Device | null;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextProps {
  user: User | null;
  device: Device | null;
  signOut(): Promise<void>;
  updateDevice(device: Device | null): Promise<void>;
  updateUser(user: User): Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [data, setData] = useState<AuthState>({} as AuthState);

  const updateContext = async () => {
    try {
      const user = await AsyncStorage.getItem("@olivia:user");

      if (user) {
        userManager.updateUser(JSON.parse(user));
        realmManager.updateToken({
          access_token: JSON.parse(user).accessToken,
          refresh_token: JSON.parse(user).refreshToken,
        });
        setData({ user: JSON.parse(user), device: null });
        return { user: JSON.parse(user), device: null };
      }

      setData({} as AuthState);
      return {} as AuthState;
    } catch (err) {}
  };

  useEffect(() => {
    updateContext();
  }, []);

  const signOut = async () => {
    await AsyncStorage.setItem("@olivia:user", "");
    await AsyncStorage.setItem("@olivia:device", "");

    userManager.updateUser(null);
    realmManager.updateToken({
      access_token: null,
      refresh_token: null,
    });
    setData({ user: null, device: null });
  };

  const updateDevice = async (device: Device) => {
    await AsyncStorage.setItem("@olivia:device", JSON.stringify(device));

    setData({ user: data.user, device });
  };

  const updateUser = async (user: User) => {
    await AsyncStorage.setItem("@olivia:user", JSON.stringify(user));

    userManager.updateUser(user);
    realmManager.updateToken({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    });
    setData({ user, device: data.device });
  };

  return (
    <AuthContext.Provider
      value={{
        user: data.user,
        device: data.device,
        signOut,
        updateDevice,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider, useAuth };
