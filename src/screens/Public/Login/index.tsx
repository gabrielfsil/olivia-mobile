import { Controller, SubmitHandler, useForm } from "react-hook-form";
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
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback } from "react";

interface LoginProps {
  navigation: any;
}

interface LoginSchema {
  email: string;
  password: string;
}

const loginSchema = yup.object().shape({
  email: yup.string().email("Email inválido").required("Email é obrigatário"),
  password: yup
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(20, "Senha deve ter no máximo 20 caracteres")
    .required("Senha é obrigatária"),
});

export function Login({ navigation }: LoginProps) {
  const { signIn } = useAuth();

  const { control, handleSubmit } = useForm({
    mode: "onChange",
    resolver: yupResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginSchema> = useCallback(async (data) => {},
  []);

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
        <Controller
          control={control}
          name="email"
          render={({ field }) => <Input placeholder="Email" {...field} />}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => <Input placeholder="Senha" secureTextEntry={true}  {...field} />}
        />
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
