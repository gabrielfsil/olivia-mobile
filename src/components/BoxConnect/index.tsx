import {
  BoxStyled,
  IconSmartwatch,
  Title,
  TextStatus,
  ContentText,
} from "./styles";
import { Ionicons } from "@expo/vector-icons";
import { useBluetooth } from "../../hooks/bluetooth";

interface BoxConnect {}

export function BoxConnect({}: BoxConnect) {
  const {
    state: { device, isConnected },
  } = useBluetooth();

  return (
    <BoxStyled>
      <IconSmartwatch>
        <Ionicons name="watch" size={56} color={"#FFFFFF"} />
      </IconSmartwatch>
      <ContentText>
        <Title>
          {device
            ? device.name && device.name.toUpperCase()
            : "Nenhum dispositivo"}
        </Title>
        <TextStatus>{isConnected ? "CONECTADO" : "DESCONECTADO"}</TextStatus>
      </ContentText>
    </BoxStyled>
  );
}
