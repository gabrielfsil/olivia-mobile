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
  ForgetButton,
  Header,
  HeaderContentButton,
  Text,
  TextForgetButton,
  TextLoading,
} from "./styles";
import { Ionicons } from "@expo/vector-icons";
import { useBluetooth } from "../../../hooks/bluetooth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Modal } from "react-native";
import { useApp, useUser } from "@realm/react";
import useLocation from "../../../services/location";
import { checkStatusAsync } from "../../../services/background";

interface HomeProps {
  navigation: any;
  route: any;
}

interface Permissions {
  location: boolean;
  bluetooth: boolean;
}

export function Home({ navigation, route }: HomeProps) {
  const { signOut } = useAuth();
  const app = useApp();
  const user = useUser();
  const {
    state: { device, isConnected },
    dispatch,
  } = useBluetooth();

  const {
    disconnectFromDevice,
    connectToDevice,
    requestPermissions,
    createDevice,
  } = useBLE();

  const { monitorLocation, requestLocationsPermissions } = useLocation();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permissions>({
    location: false,
    bluetooth: false,
  });

  const reconnectToDevice = useCallback(async () => {
    if (!isConnected && device) {
      if(device){
        const connected = await device.isConnected();

        if(!connected){
          await connectToDevice(device);
        
        }else{
          dispatch({
            type: "SET_CONNECTED",
            payload: true
          })
        }
      }
    }
  }, [isConnected, device]);

  useEffect(() => {
    requestPermissions().then((response) => {
      if (response) {
        setPermissions((prev) => ({ ...prev, bluetooth: true }));
        updateContext();
      }
    });
    requestLocationsPermissions()
      .then((response) => {
        if (response) {
          monitorLocation();
          setPermissions((prev) => ({ ...prev, location: true }));
        }
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (permissions.bluetooth && permissions.location) {
      checkStatusAsync();
    }
  }, [permissions]);

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
        <HeaderContentButton>
          <ExitButton
            onPress={async () => {
              await user.refreshCustomData();
            }}
          >
            <Ionicons name="refresh" size={24} color="black" />
          </ExitButton>
          <ExitButton
            onPress={async () => {
              await app.currentUser?.logOut();
              signOut();
            }}
          >
            <Ionicons name="exit-outline" size={24} color="black" />
          </ExitButton>
        </HeaderContentButton>
      </Header>
      <Content>
        <BoxConnect navigation={navigation} />
        {isConnected && device !== null && (
          <ForgetButton
            onPress={async () => {
              await disconnectFromDevice(device);
              dispatch({
                type: "SET_DEVICE",
                payload: null,
              });
            }}
          >
            <Ionicons name="close-circle-outline" size={24} color="black" />
            <TextForgetButton>Esquecer dispositivo</TextForgetButton>
          </ForgetButton>
        )}
        <PrimaryButton
          onPress={async () => {
            if (isConnected && device !== null) {
              await disconnectFromDevice(device);
            } else if (device !== null) {
              setLoading(true);
              await connectToDevice(device);
              setLoading(false);
            } else {
              navigation.navigate("ListDevices");
            }
          }}
          text={isConnected ? "Reiniciar Conexão" : "Conectar"}
        />
      </Content>
    </Container>
  );
}
