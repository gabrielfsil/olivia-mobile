import {
  BoxStyled,
  IconSmartwatch,
  Title,
  TextStatus,
  ContentText,
} from "./styles";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/auth";

interface BoxConnect {}

export function BoxConnect({}: BoxConnect) {

  const { device } = useAuth();

  return (
    <BoxStyled>
      <IconSmartwatch>
        <Ionicons name="watch" size={56} color={"#FFFFFF"} />
      </IconSmartwatch>
      <ContentText>
        <Title>{device.name ? device.name.toUpperCase(): "Nenhum dispositivo"}</Title>
        <TextStatus>{device.id ? "CONECTADO" : "-"}</TextStatus>
      </ContentText>
    </BoxStyled>
  );
}
