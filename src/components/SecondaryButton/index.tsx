import { ButtonStyled, TextButtonStyled } from "./styles";

interface SecondaryButtonProps {
  onPress: () => void;
  text: string;
}

export function SecondaryButton({ onPress, text }: SecondaryButtonProps) {
  return (
    <ButtonStyled onPress={onPress}>
      <TextButtonStyled>{text}</TextButtonStyled>
    </ButtonStyled>
  );
}
