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
  const { user, device, updateDevice, signOut } = useAuth();
  const { disconnectFromDevice } = useBLE();

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
      </Content>
    </Container>
  );
}
