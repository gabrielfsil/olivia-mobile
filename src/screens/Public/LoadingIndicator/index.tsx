import { ActivityIndicator } from "react-native";
import { Container, Text } from "./styles";

function LoadingIndicator() {
  return (
    <Container>
      <ActivityIndicator size="large" />
      <Text>Carregando...</Text>
    </Container>
  );
}

export { LoadingIndicator };
