import { useEffect, useState } from "react";
import useBLE from "../../../services/ble";
import { Container, ContentService, List, TextService } from "./styles";
import { useAuth } from "../../../hooks/auth";
import { useBluetooth } from "../../../hooks/bluetooth";

interface Service {
  id: number;
  uuid: string;
}

interface ListServicesProps {
  navigation: any;
  route: any;
}

const HEART_RATE_UUID = "0000180d-0000-1000-8000-00805f9b34fb";

export function ListServices({ navigation, route }: ListServicesProps) {
  const { listServices } = useBLE();
  const {
    state: { device },
  } = useBluetooth();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    console.log("Listando serviços");
    if (device) {
      listServices(device).then((response) => {
        setServices(response);
      });
    }
  }, [device]);

  return (
    <Container>
      <List
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <ContentService
            onPress={async () => {
              navigation.navigate("ListCharacteristics", {
                service: item.uuid,
              });
            }}
          >
            <TextService>{item && item.id}</TextService>
            {item.uuid === HEART_RATE_UUID && (
              <TextService>Serviço de Frequência Cardíaca</TextService>
            )}
          </ContentService>
        )}
        data={services}
      />
    </Container>
  );
}
