import { ActivityIndicator } from "react-native";
import { ButtonFooter, Container, Text, TextButtonFooter } from "./styles";
import { useApp } from "@realm/react";
import realmManager from "../../../services/realm/manager";

function LoadingIndicator() {
  const app = useApp();

  realmManager.updateUser(app.currentUser);

  return (
    <Container>
      <ActivityIndicator size="large" />
      <Text>Carregando...</Text>
      <ButtonFooter
        onPress={async () => {
          console.log("Logout user");
          await app.currentUser?.logOut();
        }}
      >
        <TextButtonFooter>Reiniciar</TextButtonFooter>
      </ButtonFooter>
    </Container>
  );
}

export { LoadingIndicator };
