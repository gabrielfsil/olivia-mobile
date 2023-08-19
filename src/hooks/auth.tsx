import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
  permission: number;
}

interface Device {
  id: string;
  name: string;
}

interface AuthState {
  user: User;
  device: Device;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextProps {
  user: User;
  device: Device;
  signIn(credentials: SignInCredentials): Promise<void>;
  updateDevice(device: Device): Promise<void>;
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
      const user = JSON.stringify({
        id: "1",
        name: "Olivia",
        email: "XXXXXXXXXXXXXXXXX",
        permission: 1,
      });

      const device = undefined;

      if (user && device) {
        return { user: JSON.parse(user), device: JSON.parse(device) };
      }

      if (user) {
        return { user: JSON.parse(user), device: {} as Device };
      }

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
      name: "Olivia",
      email: "XXXXXXXXXXXXXXXXX",
      permission: 1,
    };

    // localStorage.setItem("@olivia:user", JSON.stringify(user));
    // localStorage.setItem("@olivia:device", JSON.stringify({} as Device));

    setData({ user, device: {} as Device });
  };

  const updateDevice = async (device: Device) => {
    localStorage.setItem("@olivia:device", JSON.stringify(device));

    setData({ user: data.user, device });
  };

  return (
    <AuthContext.Provider
      value={{
        user: data.user,
        device: data.device,
        signIn,
        updateDevice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider, useAuth };
