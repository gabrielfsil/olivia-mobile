import styled from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  background: ${({ theme }) => theme.COLORS.BACKGROUND};
  padding: 24px 16px;
`;

export const Content = styled.View`
  flex: 1;
`;

export const Text = styled.Text`
  font-size: 24px;
  color: ${({ theme }) => theme.COLORS.TEXT_SECONDARY};
`;

export const HeaderContentButton = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;

export const Header = styled.View`
  justify-content: space-between;
  margin: 16px;
  flex-direction: row;
  align-items: center;
`;

export const ExitButton = styled.TouchableOpacity`
  align-items: center;
`;

export const ForgetButton = styled.TouchableOpacity`
  align-items: center;
  margin-top: 16px;
  flex-direction: row;
  padding: 8px;
`;

export const TextForgetButton = styled.Text`
  font-size: 16px;
  margin-left: 8px;
`;

export const TextLoading = styled.Text`
  margin-left: 16px;
  margin-bottom: 16px;
  font-size: 24px;
`;

export const ContentLoading = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
`;
