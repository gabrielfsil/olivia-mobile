import {
  BoxStyled,
  IconSmartwatch,
  Title,
  TextStatus,
  ContentText,
} from "./styles";
import { Ionicons } from "@expo/vector-icons";
import { useBluetooth } from "../../hooks/bluetooth";

interface BoxConnectProps {
  navigation: any;
}

export function BoxConnect({ navigation }: BoxConnectProps) {
  const {
    state: { device, isConnected },
  } = useBluetooth();

  return (
    <BoxStyled
      onPress={() => {
        navigation.navigate("ListServices");
      }}
    >
      <IconSmartwatch>
        <Ionicons name="watch" size={56} color={"#FFFFFF"} />
      </IconSmartwatch>
      <ContentText>
        <Title>
          { device !== null 
            ? device.name && device.name.toUpperCase()
            : "Nenhum dispositivo"}
        </Title>
        <TextStatus>{isConnected ? "CONECTADO" : "DESCONECTADO"}</TextStatus>
      </ContentText>
    </BoxStyled>
  );
}
