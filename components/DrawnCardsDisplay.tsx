import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import Animated from "react-native-reanimated";
import { TapGestureHandler, State } from "react-native-gesture-handler";
import TarotCard from "./TarotCard";
import { ISelectedAndShownCard } from "@/constants/tarotCards";
import { useCardFlipAnimation } from "@/hooks/useCardFlipAnimation";
import { componentStyles, glowEffects, textStyles } from "@/styles";
import { typography } from "@/styles/theme";
import { colors } from "@/styles/theme";
import { borderEffects } from "@/styles";

interface DrawnCardsDisplayProps {
  selectedCards: ISelectedAndShownCard[];
  onDismiss: () => void;
  currentRound: number;
}

export default function DrawnCardsDisplay({
  selectedCards,
  onDismiss,
  currentRound,
}: DrawnCardsDisplayProps) {
  const currentCard =
    selectedCards.length > 0 ? selectedCards[selectedCards.length - 1] : null;

  const { frontAnimatedStyle, backAnimatedStyle, handleFlip } =
    useCardFlipAnimation();

  const onGestureEvent = useCallback(
    (event: any) => {
      if (event.nativeEvent.state === State.END) {
        handleFlip();
      }
    },
    [handleFlip]
  );

  return (
    <TapGestureHandler onHandlerStateChange={onGestureEvent}>
      <Animated.View style={styles.overlay}>
        <Pressable
          style={[componentStyles.modalContainer, styles.containerOverrides]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.cardInteractionArea}>
            {currentCard && (
              <View style={styles.cardContainer}>
                <Text style={[textStyles.title, styles.cardTitleOverrides]}>
                  {currentCard.name}
                </Text>

                <View style={styles.flipContainer}>
                  {/* Front Side (Card) */}
                  <Animated.View
                    style={[
                      styles.flipCard,
                      styles.flipCardFront,
                      frontAnimatedStyle,
                    ]}
                  >
                    <TarotCard
                      card={currentCard}
                      animatedStyle={styles.cardOverrides}
                    />
                    {/* TODO: Add a hint icon/text */}
                  </Animated.View>

                  {/* Back Side (Explanation) */}
                  <Animated.View
                    style={[
                      styles.flipCard,
                      styles.flipCardBack,
                      backAnimatedStyle,
                    ]}
                  >
                    <ScrollView style={styles.explanationScrollView}>
                      <Text
                        style={[
                          textStyles.body,
                          styles.explanationTextOverrides,
                        ]}
                      >
                        {currentCard.explanation}
                      </Text>
                    </ScrollView>
                  </Animated.View>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={onDismiss}
            style={[componentStyles.buttonFullWidth, styles.buttonOverrides]}
          >
            <Text style={typography.button}>Schliessen</Text>
          </TouchableOpacity>
        </Pressable>
      </Animated.View>
    </TapGestureHandler>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  containerOverrides: {
    flexDirection: "column",
    padding: 20,
    width: "90%",
    maxHeight: "90%",
    alignItems: "stretch",
  },
  cardInteractionArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  cardContainer: {
    marginBottom: 24,
  },
  cardTitleOverrides: {
    color: "#A78BFA",
    marginBottom: 15,
    textAlign: "center",
  },
  cardWrapper: {
    width: 160,
    height: 256,
    alignItems: "center",
    justifyContent: "center",
    ...glowEffects.medium,
    borderRadius: 16,
    marginBottom: 24,
  },
  cardOverrides: {
    width: "100%",
    height: "100%",
  },
  explanationTextOverrides: {
    textAlign: "left",
    paddingHorizontal: 0,
  },
  buttonOverrides: {
    borderTopWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    marginTop: 16,
  },
  flipContainer: {
    width: 180,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  flipCard: {
    width: 160,
    height: 256,
    position: "absolute",
    backfaceVisibility: "hidden",
    backgroundColor: colors.backgroundLight,
    padding: 15,
    ...borderEffects.standard,
    ...glowEffects.medium,
  },
  flipCardFront: {
    padding: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  flipCardBack: {
    justifyContent: "center",
    alignItems: "center",
  },
  explanationScrollView: {
    width: "100%",
  },
});
