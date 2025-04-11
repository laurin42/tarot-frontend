import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Image } from "expo-image";
import { getCardImageByName, CARD_BACK_IMAGES } from "@/constants/tarotcards";

interface DynamicTarotCardProps {
  cardName: string; // Name der Karte, wird zum dynamischen Laden verwendet
  isShown?: boolean; // Ob Vorder- oder Rückseite gezeigt wird
  cardBackIndex?: number; // Index für die gewünschte Kartenrückseite (0, 1, oder 2)
  style?: any; // Zusätzliche Styles (will now control size)
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
  isShown = true,
  cardBackIndex = 0, // Standardmäßig die erste Rückseite (Index 0)
  style,
}: DynamicTarotCardProps) {
  const [imageSource, setImageSource] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Stelle sicher, dass der Index gültig ist
    const validCardBackIndex =
      cardBackIndex >= 0 && cardBackIndex < CARD_BACK_IMAGES.length
        ? cardBackIndex
        : 0;

    if (isShown) {
      try {
        const source = getCardImageByName(cardName);
        setImageSource(source);
        setIsLoading(false);
      } catch (err) {
        console.error("Fehler beim Laden der Karte:", err);
        setError("Konnte Karte nicht laden");
        setIsLoading(false);
      }
    } else {
      // Wenn die Rückseite gezeigt werden soll, lade das entsprechende Bild aus dem Array
      setImageSource(CARD_BACK_IMAGES[validCardBackIndex]);
      setIsLoading(false);
      setError(null); // Setze Fehler zurück, falls zuvor einer aufgetreten ist
    }
  }, [cardName, isShown, cardBackIndex]); // Füge cardBackIndex zur Abhängigkeitsliste hinzu

  // Wähle die korrekte Bildquelle basierend auf isShown und cardBackIndex
  const finalImageSource = isShown
    ? imageSource
    : CARD_BACK_IMAGES[
        cardBackIndex >= 0 && cardBackIndex < CARD_BACK_IMAGES.length
          ? cardBackIndex
          : 0
      ];

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
          // Verwende die ermittelte Bildquelle
          source={finalImageSource}
          // placeholder={isShown ? blurhash : undefined} // Beispielhaft auskommentiert, falls du Placeholder verwendest
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
    borderWidth: 0.3,
    borderColor: "black", // Testweise auf schwarz ändern
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000", // Test: Undurchsichtiger schwarzer Hintergrund
  },
  image: {
    width: "100%",
    height: "100%",
  },
  nameContainer: {
    position: "absolute",
    bottom: 4,
    left: 4,
    right: 4, // Sorge dafür, dass der Text ggf. umbricht
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Etwas dunkler für besseren Kontrast
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4, // Etwas mehr Padding
  },
  nameText: {
    color: "white",
    fontSize: 12, // Kleinere Schriftgröße für Namen
    fontWeight: "bold",
    textAlign: "center", // Zentrierter Text
  },
  loadingText: {
    color: "rgba(255, 215, 0, 0.8)", // Goldene Ladeanzeige
    textAlign: "center",
    padding: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: "rgba(255, 0, 0, 0.1)", // Leichter roter Hintergrund bei Fehler
  },
  errorText: {
    color: "red",
    textAlign: "center",
    fontSize: 12,
  },
});
