import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { SecondaryButton } from "../../../components/SecondaryButton";
import { useAuth } from "../../../hooks/auth";
import {
  ButtonFooter,
  ButtonHeader,
  Container,
  Content,
  ContentSubmitButton,
  Footer,
  Header,
  Image,
  Input,
  Text,
  TextButtonHeader,
  TextError,
  Title,
} from "./styles";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback } from "react";
import { Alert } from "react-native";

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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginSchema> = useCallback(
    async (data) => {
      try {
        await signIn({
          email: data.email,
          password: data.password,
        });
        navigation.navigate("Home");
      } catch (err) {
        console.log(err);
        Alert.alert("Email/Senha inválidos");
      }
    },
    [navigation]
  );

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
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Email"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
        {errors.email && <TextError>{errors.email.message}</TextError>}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Senha"
              secureTextEntry={true}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
        {errors.password && <TextError>{errors.password.message}</TextError>}
        <ContentSubmitButton>
          <SecondaryButton text="Entrar" onPress={handleSubmit(onSubmit)} />
        </ContentSubmitButton>
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
