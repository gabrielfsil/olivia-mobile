import styled from "styled-components/native";

export const BoxStyled = styled.TouchableOpacity`
  border-radius: 8px;
  padding: 8px;
  background: ${({ theme }) => theme.COLORS.BACKGROUND_SECONDARY};
  border-width: 1px;
  border-style: solid;
  border-color: ${({ theme }) => theme.COLORS.TEXT_PRIMARY};
  margin-left: 4px;
  margin-right: 4px;
  flex-direction: row;
`;

export const IconSmartwatch = styled.View`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.COLORS.SECONDARY};
`;

export const ContentText = styled.View`
  padding: 16px;
`;

export const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.COLORS.TEXT_SECONDARY};
`;

export const TextStatus = styled.Text`
  color: ${({ theme }) => theme.COLORS.TEXT_SECONDARY};
`;
