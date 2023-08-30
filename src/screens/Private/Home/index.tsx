import { useCallback, useEffect } from "react";
import { BoxConnect } from "../../../components/BoxConnect";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { useAuth } from "../../../hooks/auth";
import useBLE from "../../../services/ble";
import { Container, Content, ExitButton, Header, Text } from "./styles";
import { Ionicons } from "@expo/vector-icons";
interface HomeProps {
  navigation: any;
  route: any;
}

export function Home({ navigation, route }: HomeProps) {
  const { user, device, updateDevice } = useAuth();
  const { disconnectFromDevice, startStreamingData } = useBLE();

  return (
    <Container>
      <Header>
        <Text>{user.name}</Text>
        <ExitButton
          onPress={() => {
            if (device) {
              startStreamingData(device);
            }
          }}
        >
          <Ionicons name="exit-outline" size={24} color="black" />
        </ExitButton>
      </Header>
      <Content>
        <BoxConnect />
      </Content>

      <PrimaryButton
        onPress={() => {
          if (device && device.id) {
            disconnectFromDevice();
            updateDevice(null);
          } else {
            navigation.navigate("ListDevices");
          }
        }}
        text={device ? "Desconectar" : "Conectar"}
      />
    </Container>
  );
}
