import { useEffect } from "react";
import useBLE from "../../../services/ble";
import { Container, ContentDevice, List, NameDevice } from "./styles";
import { useAuth } from "../../../hooks/auth";

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

  const { updateDevice } = useAuth()

  useEffect(() => {
    const scanForDevices = async () => {
      const isPermissionsEnabled = await requestPermissions();
      if (isPermissionsEnabled) {
        scanForPeripherals();
      }
    };
    scanForDevices();
  }, []);

  useEffect(() => {
    if(connectedDevice){
      updateDevice({
        name: connectedDevice.name || "Desconhecido",
        id: connectedDevice.id
      })
    }
  },[connectedDevice]);

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
