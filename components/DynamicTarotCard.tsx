import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Image } from "expo-image";
import { getCardImageByName, CARD_BACK_IMAGE } from "@/constants/tarotcards";

interface DynamicTarotCardProps {
  cardName: string; // Name der Karte, wird zum dynamischen Laden verwendet
  size?: "small" | "medium" | "large"; // Für verschiedene Größen
  isShown?: boolean; // Ob Vorder- oder Rückseite gezeigt wird
  style?: any; // Zusätzliche Styles
}

/**
 * Dynamische Tarotkarten-Komponente, die Bilder basierend auf dem Namen automatisch lädt
 *
 * Verwendung:
 * <DynamicTarotCard
 *   cardName="Der Narr"
 *   size="medium"
 *   isShown={true}
 * />
 */
export default function DynamicTarotCard({
  cardName,
  size = "medium",
  isShown = true,
  style,
}: DynamicTarotCardProps) {
  const [imageSource, setImageSource] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const source = getCardImageByName(cardName);
      setImageSource(source);
      setIsLoading(false);
    } catch (err) {
      console.error("Fehler beim Laden der Karte:", err);
      setError("Konnte Karte nicht laden");
      setIsLoading(false);
    }
  }, [cardName, isShown, size]);

  return (
    <View style={[styles.container, style]}>
      {isLoading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <Image
          style={styles.image}
          source={isShown ? imageSource : CARD_BACK_IMAGE}
          // placeholder={isShown ? blurhash : undefined}
          contentFit="contain"
          transition={200}
        />
      )}
      {isShown && (
        <View style={styles.nameContainer}>
          <Text style={styles.nameText}>{cardName}</Text>
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
  loadingText: {
    color: "white",
    textAlign: "center",
    padding: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
});
