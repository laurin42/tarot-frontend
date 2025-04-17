import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import TarotCard from "@/components/TarotCard";
import { Colors } from "@/constants/colors";
import { useDailyCard } from "@/hooks/useDailyCard";

export default function DailyCardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const { card, explanation, loading, error, isDrawn, drawDailyCard } =
    useDailyCard();

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={styles.title}>Deine Tageskarte</Text>
        <View style={styles.centeredContent}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.drawButton}
            onPress={drawDailyCard}
            disabled={loading}
            testID="retry-button"
            accessibilityState={{ disabled: loading }}
          >
            <Text style={styles.buttonText}>
              {loading ? "Lade..." : "Erneut versuchen"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading && !isDrawn) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={styles.title}>Deine Tageskarte</Text>
        <View style={styles.centeredContent}>
          <ActivityIndicator
            size="large"
            color={colors.tint}
            testID="loading-indicator"
          />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Prüfe heutige Karte...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.title}>Deine Tageskarte</Text>

      {!isDrawn ? (
        <View style={styles.centeredContent}>
          <Text
            style={[styles.infoText, { color: colors.text, marginBottom: 30 }]}
          >
            Du hast heute noch keine Tageskarte gezogen.
          </Text>
          <TouchableOpacity
            style={styles.drawButton}
            onPress={drawDailyCard}
            disabled={loading}
            testID="draw-card-button"
            accessibilityState={{ disabled: loading }}
          >
            <Text style={styles.buttonText}>
              {loading ? "Ziehe Karte..." : "Tageskarte ziehen"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cardContainer}>
          {card && (
            <>
              <Text style={styles.cardName}>{card.name}</Text>
              <View style={styles.cardWrapper}>
                <TarotCard
                  card={card}
                  animatedStyle={{ width: 160, height: 256 }}
                />
              </View>
              <Text style={styles.explanation}>{explanation}</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  title: {
    color: "#A78BFA",
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 24,
    textAlign: "center",
  },
  drawButton: {
    backgroundColor: "rgba(249, 115, 22, 0.9)",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardContainer: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    width: "90%",
  },
  cardName: {
    color: "#A78BFA",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
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
    marginBottom: 20,
  },
  explanation: {
    color: "#F3F4F6",
    fontSize: 17,
    lineHeight: 26,
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 10,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
});
