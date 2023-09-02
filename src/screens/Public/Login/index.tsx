import { SecondaryButton } from "../../../components/SecondaryButton";
import { useAuth } from "../../../hooks/auth";
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
  const { signIn } = useAuth();
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
          onPress={async () => {
            await signIn({
              email: "gabriel@gmail.com",
              password: "XXXXXX",
            });
            navigation.navigate("Home");
          }}
        />
      </Content>
      <Footer>
        <ButtonFooter
          onPress={() => {
            navigation.navigate("Register");
          }}
        >
          <Text>Não tem uma conta? Registre-se!</Text>
        </ButtonFooter>
      </Footer>
    </Container>
  );
}
