import { SecondaryButton } from "../../../components/SecondaryButton";
import {
  ButtonFooter,
  Container,
  Content,
  Footer,
  Image,
  Input,
  Text,
  Title,
} from "./styles";

export function Login() {
  return (
    <Container>
      <Image source={require("../../../assets/logo.png")} />
      <Title>Olivia</Title>
      <Content>
        <Input placeholder="Email" />
        <Input placeholder="Senha" />
        <SecondaryButton text="Entrar" onPress={() => {}} />
      </Content>
      <Footer>
        <ButtonFooter onPress={() => {}}>
          <Text>Não tem uma conta? Registre-se!</Text>
        </ButtonFooter>
      </Footer>
    </Container>
  );
}
