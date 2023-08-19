import { useEffect } from "react";
import useBLE from "../../../services/ble";
import { Container, ContentDevice, List, NameDevice } from "./styles";

export function ListDevices() {
  const {
    allDevices,
    requestPermissions,
    scanForPeripherals,
    connectToDevice,
    disconnectFromDevice,
    connectedDevice,
    heartRate,
  } = useBLE();

  useEffect(() => {
    const scanForDevices = async () => {
      const isPermissionsEnabled = await requestPermissions();
      if (isPermissionsEnabled) {
        scanForPeripherals();
      }
    };
    scanForDevices();
  }, []);

  return (
    <Container>
      <List
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <ContentDevice
            onPress={() => {
              connectToDevice(item);
            }}
          >
            <NameDevice>{item.name}</NameDevice>
          </ContentDevice>
        )}
        data={allDevices}
      />
    </Container>
  );
}
