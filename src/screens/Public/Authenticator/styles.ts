import styled from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  background: ${({ theme }) => theme.COLORS.PRIMARY};
  padding: 24px 16px;
`;

export const Title = styled.Text`
  font-size: 32px;
  color: ${({ theme }) => theme.COLORS.TEXT_PRIMARY};
  text-align: center;
  font-weight: bold;
`;

export const Text = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.COLORS.TEXT_PRIMARY};
  text-align: justify;
  line-height: 24px;
`;

export const Content = styled.ScrollView`
  margin-top: 24px;
  padding: 0 16px;
`;

export const Footer = styled.View`
  justify-content: center;
`;

export const ButtonFooter = styled.TouchableOpacity`
  background: ${({ theme }) => theme.COLORS.SECONDARY};
  margin-top: 16px;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
`;

export const TextButtonFooter = styled.Text`
  font-size: 24px;
  color: ${({ theme }) => theme.COLORS.TEXT_PRIMARY};
  text-align: center;
`;
