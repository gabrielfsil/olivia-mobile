import { useEffect, useState } from "react";
import useBLE from "../../../services/ble";
import { Container, ContentService, List, TextService } from "./styles";
import { useBluetooth } from "../../../hooks/bluetooth";

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

const HEART_RATE_CHARACTERISTIC = "00002a37-0000-1000-8000-00805f9b34fb";

export function ListCharacteristics({
  navigation,
  route,
}: ListCharacteristicsProps) {
  const { service } = route.params;

  const { listCharacteristics } = useBLE();
  const {
    state: { device },
  } = useBluetooth();
  const [characteristics, setCharacteristics] = useState<Characteristc[]>([]);

  useEffect(() => {
    console.log("Listando caracteristicas");
    if (device) {
      listCharacteristics(device, service).then((response) => {
        setCharacteristics(response);
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
            {item.uuid === HEART_RATE_CHARACTERISTIC && (
              <TextService>Monitor de Frequância Cardíaca</TextService>
            )}
          </ContentService>
        )}
        data={characteristics}
      />
    </Container>
  );
}
