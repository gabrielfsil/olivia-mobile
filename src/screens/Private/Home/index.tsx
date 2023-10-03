import { useCallback, useEffect, useState } from "react";
import { BoxConnect } from "../../../components/BoxConnect";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { SecondaryButton } from "../../../components/SecondaryButton";
import { useAuth } from "../../../hooks/auth";
import useBLE from "../../../services/ble";
import {
  Container,
  Content,
  ContentLoading,
  ExitButton,
  Header,
  Text,
  TextLoading,
} from "./styles";
import { Ionicons } from "@expo/vector-icons";
import { useBluetooth } from "../../../hooks/bluetooth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Device } from "react-native-ble-plx";
import { ActivityIndicator, Modal } from "react-native";
import { useRealm } from "../../../hooks/realm";
interface HomeProps {
  navigation: any;
  route: any;
}

export function Home({ navigation, route }: HomeProps) {
  const { user, signOut } = useAuth();
  const {
    state: { device, isConnected },
    dispatch,
  } = useBluetooth();
  const { createDevice } = useBLE();

  const { disconnectFromDevice, connectToDevice, requestPermissions } =
    useBLE();
  const [loading, setLoading] = useState(false);

  const reconnectToDevice = useCallback(async () => {
    if (isConnected && device) {
      await connectToDevice(device);
    }
  }, [isConnected, device]);

  useEffect(() => {
    requestPermissions().then((response) => {
      if (response) {
        console.log("Permissions granted");
        updateContext();
      }
    });
  }, []);

  useEffect(() => {
    reconnectToDevice();
  }, [reconnectToDevice]);

  const updateContext = useCallback(async () => {
    const deviceStorage = await AsyncStorage.getItem("@olivia:device");

    if (deviceStorage) {
      dispatch({
        type: "SET_DEVICE",
        payload: createDevice(JSON.parse(deviceStorage)),
      });
    }
  }, []);

  return (
    <Container>
      <Modal
        animationType="slide"
        transparent={true}
        visible={loading}
        onRequestClose={() => {}}
      >
        <ContentLoading>
          <ActivityIndicator size={"large"} color={"#855EE0"} />
          <TextLoading>Conectando o dispositivo...</TextLoading>
        </ContentLoading>
      </Modal>
      <Header>
        <Text>Olá</Text>
        <ExitButton
          onPress={() => {
            signOut();
          }}
        >
          <Ionicons name="exit-outline" size={24} color="black" />
        </ExitButton>
      </Header>
      <Content>
        <BoxConnect navigation={navigation} />
        <PrimaryButton
          onPress={async () => {
            if (isConnected && device) {
              await disconnectFromDevice(device);
            } else if (device) {
              setLoading(true);
              await connectToDevice(device);
              setLoading(false);
            } else {
              navigation.navigate("ListDevices");
            }
          }}
          text={isConnected ? "Desconectar" : "Conectar"}
        />
      </Content>
    </Container>
  );
}
