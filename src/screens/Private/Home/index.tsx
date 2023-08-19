import { BoxConnect } from "../../../components/BoxConnect";
import { PrimaryButton } from "../../../components/PrimaryButton";
import { Container } from "./styles";

interface HomeProps {
  navigation: any;
  route: any;
}

export function Home({ navigation, route }: HomeProps) {
  return (
    <Container>
      <BoxConnect />
      <PrimaryButton
        onPress={() => {
          navigation.navigate("ListDevices");
        }}
        text="Conectar"
      />
    </Container>
  );
}
