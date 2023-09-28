import { useEffect, useState } from "react";
import useBLE from "../../../services/ble";
import { Container, ContentService, List, TextService } from "./styles";
import { useAuth } from "../../../hooks/auth";

interface Service {
  id: number;
  uuid: string;
}

interface ListServicesProps {
  navigation: any;
  route: any;
}

export function ListServices({ navigation, route }: ListServicesProps) {
  const { listServices, connectedDevice } = useBLE();
  const { device } = useAuth();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    console.log("Listando serviços");
    console.log(device);
    if (device) {
      listServices(device).then((response) => {
        setServices(response);
        console.log(response);
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
            <TextService>{item && item.uuid}</TextService>
          </ContentService>
        )}
        data={services}
      />
    </Container>
  );
}
