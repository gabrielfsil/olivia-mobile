import { ThemeProvider } from "styled-components/native";
import light from "./src/theme/light";
import { Routes } from "./src/Routes";
import { StatusBar } from "react-native";

export default function App() {
  return (
    <ThemeProvider theme={light}>
      <StatusBar  backgroundColor={"#855EE0"}/>
      <Routes />
    </ThemeProvider>
  );
}
