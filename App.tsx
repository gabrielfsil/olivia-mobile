import { ThemeProvider } from "styled-components/native";
import light from "./src/theme/light";
import { Routes } from "./src/Routes";
import { StatusBar } from "react-native";
import { AuthProvider } from "./src/hooks/auth";
import { RealmProvider } from "./src/hooks/realm";

export default function App() {
  return (
    <ThemeProvider theme={light}>
      <StatusBar backgroundColor={"#855EE0"} />
      <AuthProvider>
        <RealmProvider>
          <Routes />
        </RealmProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
