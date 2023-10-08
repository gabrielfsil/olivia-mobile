import React, { createContext, useContext, useEffect, useState } from "react";
import { Device } from "react-native-ble-plx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "@env";
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
  signIn(credentials: SignInCredentials): Promise<void>;
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

  const signIn = async ({ email, password }: SignInCredentials) => {
    const response = await axios({
      method: "POST",
      url: `${API_URL}/users/session`,
      data: { email, password },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    const { token, user } = response.data;

    await AsyncStorage.setItem("@olivia:user", JSON.stringify(user));
    
    setData({
      user: {
        ...user,
        token,
      },
      device: null,
    });

    return response.data;
  };

  const signOut = async () => {
    await AsyncStorage.setItem("@olivia:user", "");
    await AsyncStorage.setItem("@olivia:device", "");

    setData({ user: null, device: null });
  };

  const updateDevice = async (device: Device) => {
    await AsyncStorage.setItem("@olivia:device", JSON.stringify(device));

    setData({ user: data.user, device });
  };

  const updateUser = async (user: User) => {
    await AsyncStorage.setItem("@olivia:user", JSON.stringify(user));

    setData({ user, device: data.device });
  };

  return (
    <AuthContext.Provider
      value={{
        user: data.user,
        device: data.device,
        signIn,
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
