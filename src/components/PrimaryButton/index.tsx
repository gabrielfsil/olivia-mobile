import { ButtonStyled, TextButtonStyled } from "./styles";

interface PrimaryButtonProps {
  onPress: () => void;
  text: string;
}

export function PrimaryButton({ onPress, text }: PrimaryButtonProps) {
  return (
    <ButtonStyled onPress={onPress}>
      <TextButtonStyled>{text}</TextButtonStyled>
    </ButtonStyled>
  );
}
