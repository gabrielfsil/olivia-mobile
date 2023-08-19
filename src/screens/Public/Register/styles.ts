import styled from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  background: ${({ theme }) => theme.COLORS.BACKGROUND};
  padding: 24px 16px;
  justify-content: space-between;
`;

export const Text = styled.Text`
  font-size: 48px;
  color: ${({ theme }) => theme.COLORS.TEXT_SECONDARY};
`;


