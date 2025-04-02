import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Image } from "expo-image";
import { tarotDeckOptimizer } from "@/utils/tarotDeckOptimizer";

interface OptimizedTarotCardProps {
  cardId: string; // ID der Karte für Cache-Lookup
  imageSource: number; // Original require('./path') für Fallback
  size?: "small" | "medium" | "large"; // Für verschiedene Größen
  isShown: boolean; // Ob Vorder- oder Rückseite gezeigt wird
  style?: any; // Zusätzliche Styles
  name?: string; // Kartenname (optional)
}

export default function OptimizedTarotCard({
  cardId,
  imageSource,
  size = "medium",
  isShown = true,
  style,
  name,
}: OptimizedTarotCardProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lade das optimierte Bild aus dem Cache
  useEffect(() => {
    let isMounted = true;

    async function loadOptimizedImage() {
      if (!isShown) return; // Keine Optimierung für Rückseite notwendig

      try {
        // Versuche optimiertes Bild aus dem Cache zu laden
        const cachedCards = tarotDeckOptimizer.getCards([cardId]);

        if (cachedCards.length > 0) {
          const card = cachedCards[0];
          let uri;

          // Wähle die richtige Bildgröße basierend auf dem size-Parameter
          if (size === "small") {
            uri = card.thumbnailUri;
          } else if (size === "large") {
            // Lade Detail-Bild wenn nötig
            if (!card.detailUri) {
              const detailCard = await tarotDeckOptimizer.getCardDetail(
                cardId,
                imageSource
              );
              uri = detailCard.detailUri || card.regularUri;
            } else {
              uri = card.detailUri;
            }
          } else {
            uri = card.regularUri;
          }

          if (isMounted) {
            setImageUri(uri);
            setIsLoading(false);
          }
        } else {
          // Falls keine optimierte Version gefunden wurde, lade sie on-the-fly
          console.log(
            `Card ${cardId} not found in optimizer cache, optimizing now`
          );
          const uri = await tarotDeckOptimizer.getCardDetail(
            cardId,
            imageSource
          );

          if (isMounted) {
            setImageUri(size === "small" ? uri.thumbnailUri : uri.regularUri);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error(
          `Failed to load optimized image for card ${cardId}:`,
          error
        );
        setIsLoading(false);
      }
    }

    loadOptimizedImage();

    return () => {
      isMounted = false;
    };
  }, [cardId, imageSource, size, isShown]);

  // Blurhash für besseren Ladeeffekt
  const blurhash = "LEHV6nWB2yk8pyo0adR*.7kCMdnj";

  return (
    <View style={[styles.container, style]}>
      <Image
        style={styles.image}
        source={
          isShown
            ? imageUri
              ? { uri: imageUri }
              : imageSource
            : require("@/assets/images/tarot_cards/Card_back.png")
        }
        placeholder={isShown ? blurhash : undefined}
        contentFit="contain"
        transition={200}
      />
      {isShown && name && (
        <View style={styles.nameContainer}>
          <Text style={styles.nameText}>{name}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    borderWidth: 0.4,
    borderColor: "rgba(224, 224, 224, 1)",
    borderRadius: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  nameContainer: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 4,
    padding: 2,
  },
  nameText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
