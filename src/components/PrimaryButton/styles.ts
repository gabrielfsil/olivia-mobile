import styled from "styled-components/native";

export const ButtonStyled = styled.TouchableOpacity`
  width: 100%;
  background: ${({ theme }) => theme.COLORS.PRIMARY};
  border-radius: 8px;
  padding: 8px;
  margin-top: 8px;
`;

export const TextButtonStyled = styled.Text`
  color: ${({ theme }) => theme.COLORS.TEXT_PRIMARY};
  font-size: 24px;
  text-align: center;
`;
