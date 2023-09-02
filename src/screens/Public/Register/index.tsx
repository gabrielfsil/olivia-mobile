import { SecondaryButton } from "../../../components/SecondaryButton";
import { useAuth } from "../../../hooks/auth";
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

interface RegisterProps {
  navigation: any;
}

export function Register({ navigation }: RegisterProps) {
  const { signIn } = useAuth();
  return (
    <Container>
      <Image source={require("../../../assets/logo.png")} />
      <Title>Olivia</Title>
      <Content>
        <Input placeholder="Nome" />
        <Input placeholder="Email" />
        <Input placeholder="Data de Nascimento" />
        <Input placeholder="Senha" />
        <SecondaryButton
          text="Cadastrar"
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
            navigation.navigate("Login");
          }}
        >
          <Text>Já está cadastrado? Entre!</Text>
        </ButtonFooter>
      </Footer>
    </Container>
  );
}
