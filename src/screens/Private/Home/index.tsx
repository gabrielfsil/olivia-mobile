import { useCallback, useEffect } from "react";
import { BoxConnect } from "../../../components/BoxConnect";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { SecondaryButton } from "../../../components/SecondaryButton";
import { useAuth } from "../../../hooks/auth";
import useBLE from "../../../services/ble";
import { Container, Content, ExitButton, Header, Text } from "./styles";
import { Ionicons } from "@expo/vector-icons";
import { useBluetooth } from "../../../hooks/bluetooth";
interface HomeProps {
  navigation: any;
  route: any;
}

export function Home({ navigation, route }: HomeProps) {
  const { user, signOut } = useAuth();
  const {
    state: { device, isConnected },
  } = useBluetooth();
  const { disconnectFromDevice, connectToDevice } = useBLE();

  useEffect(() => {
    reaconnectToDevice();
  }, []);

  const reaconnectToDevice = useCallback(async () => {
    if (isConnected && device) {
      await connectToDevice(device);
    }
  }, []);

  return (
    <Container>
      <Header>
        <Text>Olá, {user ? user.name : "Visitante"}</Text>
        <ExitButton
          onPress={() => {
            signOut();
          }}
        >
          <Ionicons name="exit-outline" size={24} color="black" />
        </ExitButton>
      </Header>
      <Content>
        <BoxConnect />
        <SecondaryButton
          onPress={() => {
            navigation.navigate("ListServices");
          }}
          text="Listar Serviços"
        />
        <PrimaryButton
          onPress={() => {
            if (isConnected) {
              disconnectFromDevice();
            } else {
              navigation.navigate("ListDevices");
            }
          }}
          text={isConnected ? "Desconectar" : "Conectar"}
        />
        <SecondaryButton
          onPress={async () => {
            if (!isConnected && device) {
              await connectToDevice(device);
            }
          }}
          text="Reconetar"
        />
      </Content>
    </Container>
  );
}
