import { ButtonStyled, TextButtonStyled } from "./styles";

interface ButtonProps {
  onPress: () => void;
  text: string;
}

export function Button({ onPress, text }: ButtonProps) {
  return (
    <ButtonStyled onPress={onPress}>
      <TextButtonStyled>{text}</TextButtonStyled>
    </ButtonStyled>
  );
}
