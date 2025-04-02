import React from "react";
import OptimizedTarotCard from "./OptimizedTarotCard";

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
  // Extrahiere die ID aus dem Image-Pfad, falls verfügbar
  // Fallback für alte Verwendungen ohne korrekte ID
  const getCardIdFromImage = () => {
    if (typeof image === "number") {
      // Get the source code for the require() call
      const imageSource = image.toString();
      // Extract filename from path
      const matches = imageSource.match(/tarot_cards\/([^.]+)/);
      return matches
        ? matches[1].toLowerCase().replace(/\s+/g, "_")
        : "unknown";
    }
    return "unknown";
  };

  return (
    <OptimizedTarotCard
      cardId={getCardIdFromImage()}
      imageSource={image}
      isShown={isShown}
      name={name}
      style={style}
      size="medium"
    />
  );
}
