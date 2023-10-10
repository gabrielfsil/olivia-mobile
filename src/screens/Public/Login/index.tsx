import Realm from "realm";
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
} from "./styles";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useApp } from "@realm/react";

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

export function Login() {
  const { updateUser } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: yupResolver(loginSchema),
  });

  const app = useApp();

  // state values for toggable visibility of features in the UI
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [isInSignUpMode, setIsInSignUpMode] = useState(true);

  // signIn() uses the emailPassword authentication provider to log in
  const signInUser = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      try {
        const creds = Realm.Credentials.emailPassword(email, password);
        const user = await app.logIn(creds);
        updateUser({
          _id: user.id,
          email: user.profile.email ?? "",
          name: user.profile.name ?? "",
          permission: 1,
          accessToken: user.accessToken ?? "",
          refreshToken: user.refreshToken ?? "",
        });
      } catch (error: any) {
        console.log(error);
        Alert.alert(`Falha ao entrar: ${error?.message}`);
      }
    },
    [app, updateUser]
  );

  // onPressSignIn() uses the emailPassword authentication provider to log in
  const onPressSignIn = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      try {
        await signInUser({ email, password });
      } catch (error: any) {
        console.log(error);
        Alert.alert(`Falha ao entrar: ${error?.message}`);
      }
    },
    [signInUser]
  );

  // onPressSignUp() registers the user and then calls signIn to log the user in
  const onPressSignUp = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      try {
        await app.emailPasswordAuth.registerUser({ email, password });
        await signInUser({ email, password });
      } catch (error: any) {
        console.log(error);
        Alert.alert(`Falha ao registrar: ${error?.message}`);
      }
    },
    [signInUser, app]
  );

  const onSubmit: SubmitHandler<LoginSchema> = useCallback(
    async (data) => {
      try {
        if (isInSignUpMode) {
          await onPressSignUp({ email: data.email, password: data.password });
        } else {
          await onPressSignIn({ email: data.email, password: data.password });
        }
      } catch (err: any) {
        console.log(err);

        Alert.alert("Falha na execução:" + err?.message);
      }
    },
    [isInSignUpMode, onPressSignUp, onPressSignIn]
  );

  return (
    <Container>
      <Header>
        <ButtonHeader>
          <TextButtonHeader>Esqueci a senha!</TextButtonHeader>
        </ButtonHeader>
      </Header>
      <Image source={require("../../../assets/logo.png")} />
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
              secureTextEntry={passwordHidden}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
        {errors.password && <TextError>{errors.password.message}</TextError>}
        {isInSignUpMode ? (
          <>
            <ContentSubmitButton>
              <SecondaryButton
                text="Registrar"
                onPress={handleSubmit(onSubmit)}
              />
            </ContentSubmitButton>
            <Footer>
              <ButtonFooter onPress={() => setIsInSignUpMode(!isInSignUpMode)}>
                <Text>Já tem uma conta? Entre!</Text>
              </ButtonFooter>
            </Footer>
          </>
        ) : (
          <>
            <ContentSubmitButton>
              <SecondaryButton text="Entrar" onPress={handleSubmit(onSubmit)} />
            </ContentSubmitButton>
            <Footer>
              <ButtonFooter onPress={() => setIsInSignUpMode(!isInSignUpMode)}>
                <Text>Não tem uma conta? Registre-se!</Text>
              </ButtonFooter>
            </Footer>
          </>
        )}
      </Content>
    </Container>
  );
}
