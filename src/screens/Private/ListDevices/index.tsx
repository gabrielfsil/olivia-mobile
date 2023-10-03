import { useEffect, useState } from "react";
import useBLE from "../../../services/ble";
import {
  Container,
  ContentDevice,
  ContentLoading,
  List,
  NameDevice,
  TextLoading,
} from "./styles";
import { ActivityIndicator, Modal } from "react-native";

interface ListDevicesProps {
  navigation: any;
}

export function ListDevices({ navigation }: ListDevicesProps) {
  const {
    allDevices,
    requestPermissions,
    scanForPeripherals,
    connectToDevice,
  } = useBLE();

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const scanForDevices = async () => {
      const isPermissionsEnabled = await requestPermissions();
      if (isPermissionsEnabled) {
        const result = await scanForPeripherals();

        if (!result) {
          navigation.navigate("Home");
        }
      }
    };
    scanForDevices();
  }, []);

  return (
    <Container>
      {loading && <TextLoading>Procurando dispositivos...</TextLoading>}
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
      <List
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <ContentDevice
            onPress={async () => {
              setLoading(true);
              await connectToDevice(item);
              setLoading(false);
              navigation.navigate("Home");
            }}
          >
            <NameDevice>{item && item.name}</NameDevice>
          </ContentDevice>
        )}
        data={allDevices}
      />
    </Container>
  );
}
