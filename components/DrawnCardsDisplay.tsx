import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { TapGestureHandler, State } from "react-native-gesture-handler";
import TarotCard from "./TarotCard";
import { ISelectedAndShownCard } from "@/constants/tarotcards";
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

  // Reanimated shared value for flip state (0 = front, 1 = back)
  const flipProgress = useSharedValue(0);

  // Animated style for the front face
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      flipProgress.value,
      [0, 1],
      [0, 180],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      flipProgress.value,
      [0, 0.5, 0.5, 1],
      [1, 1, 0, 0],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ rotateY: `${rotate}deg` }],
    };
  });

  // Animated style for the back face
  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      flipProgress.value,
      [0, 1],
      [180, 360],
      Extrapolate.CLAMP
    );
    const opacity = interpolate(
      flipProgress.value,
      [0, 0.5, 0.5, 1],
      [0, 0, 1, 1],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ rotateY: `${rotate}deg` }],
    };
  });

  // Lokaler State für Button-Opazität
  const [buttonOpacity, setButtonOpacity] = useState(0.3);

  // Für Scroll-Positionsberechnung
  const scrollContainerHeight = useRef(0);
  const scrollContentHeight = useRef(0);

  // Event-Handler
  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetY = e.nativeEvent.contentOffset.y;
    const visibleHeight = scrollContainerHeight.current;
    const totalHeight = scrollContentHeight.current - visibleHeight;

    // Fortschritt von 0 bis 1:
    const progress = totalHeight > 0 ? Math.min(offsetY / totalHeight, 1) : 0;

    // Beispiel: Opazität linear von 0.3 (oben) bis 0.9 (unten)
    const newOpacity = 0.3 + progress * 0.6;
    setButtonOpacity(newOpacity);
  }

  // Gesture handler event
  const onGestureEvent = useCallback(
    (event: any) => {
      if (event.nativeEvent.state === State.END) {
        flipProgress.value = withTiming(flipProgress.value === 0 ? 1 : 0, {
          duration: 600, // Adjust duration as needed
        });
      }
    },
    [flipProgress]
  );

  return (
    <TapGestureHandler onHandlerStateChange={onGestureEvent}>
      <Animated.View style={styles.overlay}>
        <Pressable
          style={[componentStyles.modalContainer, styles.containerOverrides]}
          onPress={(e) => e.stopPropagation()} // Prevent taps inside modal from bubbling up to TapGestureHandler
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
                      name={currentCard.name}
                      image={currentCard.image}
                      isShown={true}
                      style={styles.cardOverrides} // Use overrides for 100% size
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
            style={[
              componentStyles.buttonFullWidth,
              styles.buttonOverrides,
              // Consider visual style for button
            ]}
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
    // New view to contain card content, allows button to be outside tappable area
    flex: 1,
    width: "100%",
    alignItems: "center",
    // Remove marginBottom from scrollView to let this container manage space
    // marginBottom: 10,
  },
  scrollView: {
    // Remove this style - not used directly anymore
    // flex: 1,
    // marginBottom: 10,
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
  // ... buttonOverrides ...
});
