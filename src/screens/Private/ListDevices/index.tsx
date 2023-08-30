import { useEffect, useState } from "react";
import useBLE from "../../../services/ble";
import { Container, ContentDevice, List, NameDevice } from "./styles";
import { useAuth } from "../../../hooks/auth";

interface ListDevicesProps {
  navigation: any;
}

export function ListDevices({ navigation }: ListDevicesProps) {
  const {
    allDevices,
    requestPermissions,
    scanForPeripherals,
    connectToDevice,
    disconnectFromDevice,
    connectedDevice,
    heartRate,
  } = useBLE();

  const [loading, setLoading] = useState<boolean>(false);

  const { updateDevice } = useAuth();

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

  useEffect(() => {
    if (connectedDevice) {
      updateDevice(connectedDevice);
    }
  }, [connectedDevice]);

  return (
    <Container>
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
