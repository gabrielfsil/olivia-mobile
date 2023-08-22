import styled from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  background: ${({ theme }) => theme.COLORS.PRIMARY};
  padding: 24px 16px;
`;

export const Title = styled.Text`
  font-size: 36px;
  color: ${({ theme }) => theme.COLORS.TEXT_PRIMARY};
  text-align: center;
`;

export const Text = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.COLORS.TEXT_PRIMARY};
  text-align: center;
`;

export const Image = styled.Image`
  width: 250px;
  height: 250px;
  margin: auto;
`;

export const Input = styled.TextInput`
  width: 100%;
  background: ${({ theme }) => theme.COLORS.BACKGROUND_SECONDARY};
  height: 54px;
  border-radius: 8px;
  margin-top: 8px;
  margin-bottom: 16px;
  padding-left: 16px;
`;


export const Content = styled.View`
  justify-content: center;
  margin-top: 24px;
`;

export const Footer = styled.View`
  justify-content: center;
`

export const ButtonFooter = styled.TouchableOpacity`
  background: transparent;
  margin-top: 16px;
  margin-bottom: 16px;
  padding: 12px;
`

export const Header = styled.View`
  justify-content: flex-end;
`

export const ButtonHeader = styled.TouchableOpacity`
  background: transparent;
  margin-bottom: 16px;
  margin-left: auto;
  padding: 12px;
`

export const TextButtonHeader = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.COLORS.TEXT_PRIMARY};
`