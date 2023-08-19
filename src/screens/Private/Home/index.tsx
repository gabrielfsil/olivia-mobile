import { BoxConnect } from "../../../components/BoxConnect";
import { Button } from "../../../components/Button";
import { Container } from "./styles";

interface HomeProps {
  navigation: any;
  route: any;
}

export function Home({ navigation, route }: HomeProps) {
  return (
    <Container>
      <BoxConnect />
      <Button
        onPress={() => {
          navigation.navigate("ListDevices");
        }}
        text="Conectar"
      />
    </Container>
  );
}
