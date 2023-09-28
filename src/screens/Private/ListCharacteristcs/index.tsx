import { useEffect, useState } from "react";
import useBLE from "../../../services/ble";
import { Container, ContentService, List, TextService } from "./styles";
import { useAuth } from "../../../hooks/auth";


interface Characteristc {
  id: number;
  uuid: string;
  serviceUUID: string;
  isNotifiable: boolean;
}

interface ListCharacteristicsProps {
  navigation: any;
  route: any;
}

export function ListCharacteristics({ navigation, route }: ListCharacteristicsProps) {
  const { service } = route.params;

  const { listCharacteristics } = useBLE();
  const { device } = useAuth();
  const [characteristics, setCharacteristics] = useState<Characteristc[]>([]);

  useEffect(() => {
    console.log("Listando caracteristicas");
    if (device) {
      listCharacteristics(device, service).then((response) => {
        setCharacteristics(response);
        console.log(response);
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
            <TextService>{item && item.uuid}</TextService>
          </ContentService>
        )}
        data={characteristics}
      />
    </Container>
  );
}
