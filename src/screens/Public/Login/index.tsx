import { SecondaryButton } from "../../../components/SecondaryButton";
import {
  ButtonFooter,
  ButtonHeader,
  Container,
  Content,
  Footer,
  Header,
  Image,
  Input,
  Text,
  TextButtonHeader,
  Title,
} from "./styles";

interface LoginProps {
  navigation: any;
}

export function Login({ navigation }: LoginProps) {
  return (
    <Container>
      <Header>
        <ButtonHeader>
          <TextButtonHeader>Esqueci a senha!</TextButtonHeader>
        </ButtonHeader>
      </Header>
      <Image source={require("../../../assets/logo.png")} />
      <Title>Olivia</Title>
      <Content>
        <Input placeholder="Email" />
        <Input placeholder="Senha" />
        <SecondaryButton
          text="Entrar"
          onPress={() => {
            navigation.navigate("Home");
            console.log("Login realizado");
          }}
        />
      </Content>
      <Footer>
        <ButtonFooter onPress={() => {}}>
          <Text>Não tem uma conta? Registre-se!</Text>
        </ButtonFooter>
      </Footer>
    </Container>
  );
}
