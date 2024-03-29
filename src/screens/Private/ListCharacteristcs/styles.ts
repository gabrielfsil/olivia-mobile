import styled from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  background: ${({ theme }) => theme.COLORS.BACKGROUND};
  padding: 24px 16px;
`;

export const List = styled.FlatList``;

export const ContentService = styled.TouchableOpacity`
    background: ${({ theme }) => theme.COLORS.BACKGROUND_SECONDARY};
    padding: 16px;
    border-radius: 8px;
    margin: 8px 0px;
`;

export const TextService = styled.Text`
    font-size: 16px;
    font-weight: bold;
`;
