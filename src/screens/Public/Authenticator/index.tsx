import { EMAIL, PASSWORD } from "@env";
import { useApp } from "@realm/react";
import { Alert } from "react-native";
import {
  ButtonFooter,
  Container,
  Content,
  Text,
  TextButtonFooter,
  Title,
} from "./styles";
import Realm from "realm";

function Authenticator() {
  const app = useApp();

  const logIn = async () => {
    try {
      const credentials = Realm.Credentials.emailPassword({
        email: EMAIL,
        password: PASSWORD,
      });

      await app.logIn(credentials);
    } catch (err) {
      console.log(err);
      Alert.alert(
        "Alguma coisa deu errado!",
        "Tente novamente ou esperte um pouco mais",
        [
          {
            text: "OK",
            onPress: async () => {
              await logIn();
            },
          },
        ]
      );
    }
  };
  return (
    <Container>
      <Title>Termo</Title>
      <Content>
        <Text>
          Silvio Santos Ipsum É namoro ou amizadeemm? Ma vejam só, vejam só. Eu
          só acreditoammmm.... Vendoammmm. Mah você mora com o papai ou com a
          mamãem? O arriscam tuduam, valendo um milhão de reaisuam. Estamos em
          ritmo de festamm. Ma o Silvio Santos Ipsum é muitoam interesanteam.
          Com ele ma você vai gerar textuans ha haae. Mah você não consegue né
          Moisés? Você não consegueam. Mah é a porta da esperançaam. O arriscam
          tuduam, valendo um milhão de reaisuam. Um, dois três, quatro, PIM,
          entendeuam? Ma tem ou não tem o celular do milhãouamm? Boca sujuam...
          sem vergonhuamm. Ma vale dérreaisam? O prêmio é em barras de ouro, que
          vale mais que dinheiroam. É fácil ou não éam? Ma tem ou não tem o
          celular do milhãouamm? Mah você não consegue né Moisés? Você não
          consegueam. Ma vejam só, vejam só. Mah ooooee vem pra cá. Vem pra cá.
          Um, dois três, quatro, PIM, entendeuam? Ma não existem mulher feiam,
          existem mulher que não conhece os produtos Jequitiamm.
          Wellintaaammmmmmmmm. Ma vejam só, vejam só. O prêmio é em barras de
          ouro, que vale mais que dinheiroam. Ma! Ao adquirir o carnê do Baú,
          você estará concorrendo a um prêmio de cem mil reaisam.
          Wellintaaammmmmmmmm. Estamos em ritmo de festamm. Eu só
          acreditoammmm.... Vendoammmm. Mah é a porta da esperançaam. Mah ooooee
          vem pra cá. Vem pra cá.
        </Text>
      </Content>
      <ButtonFooter onPress={logIn}>
        <TextButtonFooter>Acessar</TextButtonFooter>
      </ButtonFooter>
    </Container>
  );
}

export { Authenticator };
