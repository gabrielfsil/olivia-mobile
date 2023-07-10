import { useTheme } from "styled-components";
import {
  BoxStyled,
  IconSmartwatch,
  Title,
  TextStatus,
  ContentText,
} from "./styles";
import { Ionicons } from "@expo/vector-icons";

interface BoxConnect {}

export function BoxConnect({}: BoxConnect) {
  const theme = useTheme();

  return (
    <BoxStyled>
      <IconSmartwatch>
        <Ionicons name="watch" size={56} color={"#FFFFFF"} />
      </IconSmartwatch>
      <ContentText>
        <Title>Mi Band 5</Title>
        <TextStatus>CONECTADO</TextStatus>
      </ContentText>
    </BoxStyled>
  );
}
