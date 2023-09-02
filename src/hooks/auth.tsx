import React, { createContext, useContext, useEffect, useState } from "react";
import { Device } from "react-native-ble-plx";
interface AuthProviderProps {
  children: React.ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
  permission: number;
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
      // const user = localStorage.getItem("@olivia:user");
      // const device = localStorage.getItem("@olivia:device");
      const user = undefined;

      const device = undefined;

      if (user && device) {
        setData({ user: JSON.parse(user), device: JSON.parse(device) });
        return { user: JSON.parse(user), device: JSON.parse(device) };
      }

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
    // Requisição de Login
    const user = {
      id: "1",
      name: "Gabriel",
      email,
      permission: 1,
    };

    // localStorage.setItem("@olivia:user", JSON.stringify(user));
    // localStorage.setItem("@olivia:device", JSON.stringify({} as Device));

    setData({ user, device: null });
  };

  const signOut = async () => {
    // localStorage.setItem("@olivia:user", JSON.stringify(user));
    // localStorage.setItem("@olivia:device", JSON.stringify({} as Device));

    setData({ user: null, device: null });
  };

  const updateDevice = async (device: Device) => {
    // localStorage.setItem("@olivia:device", JSON.stringify(device));

    setData({ user: data.user, device });
  };

  return (
    <AuthContext.Provider
      value={{
        user: data.user,
        device: data.device,
        signIn,
        signOut,
        updateDevice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider, useAuth };
