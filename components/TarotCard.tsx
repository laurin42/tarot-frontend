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

const getCardIdFromImage = () => {
  if (typeof image === "number") {
    // Get the source code for the require() call
    const imageSource = image.toString();
    // Extract filename from path
    const matches = imageSource.match(/tarot_cards\/([^.]+)/);
    return matches ? matches[1].toLowerCase().replace(/\s+/g, "_") : "unknown";
  }
  return "unknown";
};

export default function TarotCard({
  image,
  name,
  isShown,
  style,
}: TarotCardProps) {
  const cardId = getCardIdFromImage();

  return (
    <DynamicTarotCard
      cardName={name ?? "Unknown Card"}
      isShown={isShown}
      size="medium"
    />
  );
}
