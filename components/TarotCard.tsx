import React from "react";
import DynamicTarotCard from "./DynamicTarotCard";

interface TarotCardProps {
  image: any;
  isShown: boolean;
  style?: any;
  name?: string;
}

export interface ITarotCard {
  id: string;
  image: any;
  description?: string;
  showFront?: boolean;
  isSelected?: boolean;
}

export default function TarotCard({
  image,
  name,
  isShown,
  style,
}: TarotCardProps) {
  return (
    <DynamicTarotCard
      cardName={name ?? "Unknown Card"}
      isShown={isShown}
      size="medium"
      style={style}
    />
  );
}
