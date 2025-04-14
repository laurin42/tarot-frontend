import React from "react";
import DynamicTarotCard from "./DynamicTarotCard";
import { ITarotCard } from "../constants/tarotCards";

interface TarotCardProps {
  card: ITarotCard;
  animatedStyle: any;
}

export default function TarotCard({
  card: { name, showFront },
  animatedStyle,
}: TarotCardProps) {
  return (
    <DynamicTarotCard
      cardName={name}
      isShown={showFront ?? true}
      style={animatedStyle}
    />
  );
}
