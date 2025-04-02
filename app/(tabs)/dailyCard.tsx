import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import TarotCard from "@/components/TarotCard";
import { tarotCards } from "@/constants/tarotcards";
import { storage } from "../../utils/storage";
import { Colors } from "@/constants/Colors";

export default function DailyCardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [isDrawn, setIsDrawn] = useState(false);

  // Prüfe, ob heute bereits eine Tageskarte gezogen wurde
  useEffect(() => {
    async function checkDailyCard() {
      try {
        const storedData = await storage.getItem("dailyCardData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          const today = new Date().toDateString();

          if (parsedData.date === today) {
            setCard(parsedData.card);
            setExplanation(parsedData.explanation);
            setIsDrawn(true);
          }
        }
      } catch (error) {
        console.error("Fehler beim Laden der Tageskarte:", error);
      }
    }

    checkDailyCard();
  }, []);

  const drawDailyCard = async () => {
    setLoading(true);
    try {
      // Zufällige Karte auswählen
      const randomCard =
        tarotCards[Math.floor(Math.random() * tarotCards.length)];
      setCard(randomCard);

      // Hole Erklärung vom Server
      const token = await storage.getItem("userToken");
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/tarot/cards/${encodeURIComponent(
          randomCard.name
        )}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!response.ok) throw new Error("Fehler beim Laden der Kartendetails");

      const data = await response.json();
      setExplanation(data.explanation);

      // Speichere Tageskarte lokal
      const today = new Date().toDateString();
      await storage.setItem(
        "dailyCardData",
        JSON.stringify({
          date: today,
          card: randomCard,
          explanation: data.explanation,
        })
      );

      setIsDrawn(true);
    } catch (error) {
      console.error("Fehler beim Ziehen der Tageskarte:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.title}>Deine Tageskarte</Text>

      {!isDrawn ? (
        <TouchableOpacity
          style={styles.drawButton}
          onPress={drawDailyCard}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Ziehe Karte..." : "Tageskarte ziehen"}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.cardContainer}>
          <Text style={styles.cardName}>{card?.name}</Text>
          <View style={styles.cardWrapper}>
            <TarotCard
              image={card?.image}
              isShown={true}
              style={{ width: 160, height: 256 }}
            />
          </View>
          <Text style={styles.explanation}>{explanation}</Text>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    color: "#A78BFA",
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 24,
  },
  drawButton: {
    backgroundColor: "rgba(249, 115, 22, 0.9)",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 40,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  cardContainer: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 16,
    alignItems: "center",
  },
  cardName: {
    color: "#A78BFA",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  cardWrapper: {
    width: 160,
    height: 256,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
    borderRadius: 16,
  },
  explanation: {
    color: "#F3F4F6",
    fontSize: 17,
    lineHeight: 26,
    textAlign: "center",
    marginTop: 24,
    padding: 16,
  },
});
