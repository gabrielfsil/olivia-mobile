import { useEffect, useState } from "react";
import useBLE from "../../../services/ble";
import { Container, ContentService, List, TextService } from "./styles";
import { useAuth } from "../../../hooks/auth";

export function ListServices() {
  const { listServices, connectedDevice } = useBLE();
  const { device } = useAuth();
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    console.log("Listando serviços");
    console.log(device);
    if (device?.isConnected()) {
      listServices(device).then((res) => {
        setServices(res);
      });
    }
  }, [device]);

  return (
    <Container>
      <List
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <ContentService onPress={async () => {}}>
            <TextService>{item && item.id}</TextService>
          </ContentService>
        )}
        data={[]}
      />
    </Container>
  );
}
