import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react-native";
import DrawnCardsDisplay from "../DrawnCardsDisplay";
import { ISelectedAndShownCard } from "@/constants/tarotCards";
import { State } from "react-native-gesture-handler";

// --- Mock Child Component ---
jest.mock("@/components/TarotCard", () => {
  const MockView = require("react-native").View;
  const MockText = require("react-native").Text;
  const MockTarotCard = (props: { card: ISelectedAndShownCard }) => (
    <MockView testID="tarot-card-mock">
      <MockText>{props.card?.name} (Mock)</MockText>
    </MockView>
  );
  MockTarotCard.displayName = "MockTarotCard";
  return MockTarotCard;
});

// --- Mock react-native-reanimated (minimal, only for Animated.View)
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  return {
    ...Reanimated,
    useAnimatedStyle: jest.fn().mockReturnValue({}),
  };
});

const mockHandleFlip = jest.fn();
jest.mock("@/hooks/useCardFlipAnimation", () => ({
  useCardFlipAnimation: jest.fn(() => ({
    frontAnimatedStyle: { opacity: 1 },
    backAnimatedStyle: { opacity: 0 },
    handleFlip: mockHandleFlip,
  })),
}));

// --- Mock react-native-gesture-handler ---
let mockGestureHandlerCallback: ((event: any) => void) | null = null;
jest.mock("react-native-gesture-handler", () => {
  const ActualGestureHandler = jest.requireActual(
    "react-native-gesture-handler"
  );
  return {
    ...ActualGestureHandler,
    TapGestureHandler: (props: any) => {
      mockGestureHandlerCallback = props.onHandlerStateChange;
      return props.children;
    },
  };
});

// --- Mock Data ---
const mockCard: ISelectedAndShownCard = {
  id: "dd-test-1",
  name: "The Empress",
  image: 3,
  showFront: true,
  isSelected: true,
  onNextCard: jest.fn(),
  explanation: "This is the explanation text.",
};
const mockOnDismiss = jest.fn();

describe("<DrawnCardsDisplay />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGestureHandlerCallback = null;
    mockOnDismiss.mockClear();
    mockHandleFlip.mockClear();
  });

  // --- Test Cases ---

  it("should render the card title, card mock, explanation, and dismiss button", () => {
    render(
      <DrawnCardsDisplay
        selectedCards={[mockCard]}
        onDismiss={mockOnDismiss}
        currentRound={0}
      />
    );

    expect(screen.getByText(mockCard.name)).toBeTruthy();
    expect(screen.getByText(`${mockCard.name} (Mock)`)).toBeTruthy();
    expect(screen.getByText(mockCard.explanation!)).toBeTruthy();
    expect(screen.getByText("Schliessen")).toBeTruthy();
  });

  it("should call onDismiss when the dismiss button is pressed", () => {
    render(
      <DrawnCardsDisplay
        selectedCards={[mockCard]}
        onDismiss={mockOnDismiss}
        currentRound={0}
      />
    );

    const dismissButton = screen.getByText("Schliessen");
    fireEvent.press(dismissButton);

    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it("should call handleFlip from hook on tap gesture", () => {
    render(
      <DrawnCardsDisplay
        selectedCards={[mockCard]}
        onDismiss={mockOnDismiss}
        currentRound={0}
      />
    );

    expect(mockGestureHandlerCallback).toBeDefined();
    expect(typeof mockGestureHandlerCallback).toBe("function");

    act(() => {
      if (mockGestureHandlerCallback) {
        mockGestureHandlerCallback({ nativeEvent: { state: State.END } });
      }
    });

    expect(mockHandleFlip).toHaveBeenCalledTimes(1);
  });
});
