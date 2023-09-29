import { useEffect, useState } from "react";
import useBLE from "../../../services/ble";
import { Container, ContentDevice, List, NameDevice, TextLoading } from "./styles";
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
  } = useBLE();

  const [loading, setLoading] = useState<boolean>(true);

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
