import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import ThreeCardsScreen from "../app/(tabs)/threecards";
import { ISelectedAndShownCard } from "@/constants/tarotCards";

jest.mock("react-native/Libraries/Utilities/Dimensions", () => ({
  get: jest.fn().mockReturnValue({ width: 400, height: 800 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

jest.mock("@/services/localTarotPool", () => ({
  getRandomLocalCardsWithExplanations: jest.fn(),
}));

// Helper data needed for mock CardStack
const mockCard1: ISelectedAndShownCard = {
  id: "1",
  name: "Card 1",
  image: "img1.png",
  explanation: "Expl 1",
  onNextCard: jest.fn(),
};

// --- Angepasster CardStack Mock ---
jest.mock("@/components/CardStack", () => {
  // const ReactNative = jest.requireActual("react-native"); // <--- DIESE ZEILE ENTFERNEN
  // const { Text, TouchableOpacity, View } = ReactNative; // <--- DIESE ZEILE ENTFERNEN
  // Stattdessen: Importiere React und nutze die Komponenten direkt (sie werden gemockt)
  const React = require("react"); // Stelle sicher, dass React verfügbar ist
  // Annahme: View, Text, TouchableOpacity sind in jest.setup.js gemockt

  const MockCardStack = ({
    onCardSelect,
  }: {
    onCardSelect: (card: ISelectedAndShownCard, index: number) => void;
  }) => (
    // Verwende View, Text, TouchableOpacity direkt. Jest löst sie zu den Mocks auf.
    <View testID="mock-card-stack">
      <Text>Minimal CardStack Mock</Text>
      <TouchableOpacity
        testID="simulate-select-btn"
        onPress={() => onCardSelect(mockCard1, 0)}
      >
        <Text>Simuliere Kartenauswahl</Text>
      </TouchableOpacity>
    </View>
  );
  MockCardStack.displayName = "MockCardStack";
  return MockCardStack;
});

// --- Angepasster DrawnCardsDisplay Mock ---
jest.mock("@/components/DrawnCardsDisplay", () => {
  // const ReactNative = jest.requireActual("react-native"); // <--- ENTFERNEN
  // const { View, Text, TouchableOpacity } = ReactNative; // <--- ENTFERNEN
  const React = require("react");

  const MockDrawnCardsDisplay = ({ onDismiss }: { onDismiss: () => void }) => (
    <View testID="mock-drawn-cards">
      <Text>Mock Drawn Cards</Text>
      <TouchableOpacity testID="dismiss-explanation-btn" onPress={onDismiss}>
        <Text>Dismiss Explanation</Text>
      </TouchableOpacity>
    </View>
  );
  MockDrawnCardsDisplay.displayName = "MockDrawnCardsDisplay";
  return MockDrawnCardsDisplay;
});

// --- Angepasster SummaryView Mock ---
jest.mock("@/components/SummaryView", () => {
  // const ReactNative = jest.requireActual("react-native"); // <--- ENTFERNEN
  // const { View, Text, TouchableOpacity } = ReactNative; // <--- ENTFERNEN
  const React = require("react");

  const MockSummaryView = ({ onDismiss }: { onDismiss: () => void }) => (
    <View testID="mock-summary-view">
      <Text>Mock Summary View</Text>
      <TouchableOpacity testID="dismiss-summary-btn" onPress={onDismiss}>
        <Text>Dismiss Summary</Text>
      </TouchableOpacity>
    </View>
  );
  MockSummaryView.displayName = "MockSummaryView";
  return MockSummaryView;
});

const mockGetRandomLocalCards = jest.requireMock("@/services/localTarotPool")
  .getRandomLocalCardsWithExplanations as jest.Mock;

// Keep other mock data as well
const mockCard2: ISelectedAndShownCard = {
  id: "2",
  name: "Card 2",
  image: "img2.png",
  explanation: "Expl 2",
  onNextCard: jest.fn(),
};
const mockCard3: ISelectedAndShownCard = {
  id: "3",
  name: "Card 3",
  image: "img3.png",
  explanation: "Expl 3",
  onNextCard: jest.fn(),
};
const mockPredeterminedCards = [mockCard1, mockCard2, mockCard3];

describe("<ThreeCardsScreen />", () => {
  beforeEach(() => {
    mockGetRandomLocalCards.mockClear();
    mockGetRandomLocalCards.mockResolvedValue([...mockPredeterminedCards]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("simple addition", () => {
    expect(1 + 1).toBe(2);
  });

  it("should render the Start button initially", () => {
    const { getByText } = render(<ThreeCardsScreen />);
    expect(getByText("Start")).toBeTruthy();
  });

  it("should call getRandomLocalCards and show CardStackView on Start press", async () => {
    const { getByText, findByTestId, queryByText } = render(
      <ThreeCardsScreen />
    );
    await act(async () => {
      fireEvent.press(getByText("Start"));
      await Promise.resolve();
    });

    const cardStack = await findByTestId("mock-card-stack");
    expect(cardStack).toBeTruthy();
    expect(queryByText("Start")).toBeNull();
    expect(mockGetRandomLocalCards).toHaveBeenCalledTimes(1);
  });

  it("should show DrawnCardsDisplay after a card is selected and positioned", async () => {
    const { getByText, findByTestId, getByTestId } = render(
      <ThreeCardsScreen />
    );
    await act(async () => {
      fireEvent.press(getByText("Start"));
      await Promise.resolve();
    });

    await findByTestId("mock-card-stack");
    await act(async () => {
      // Make sure the mock passes data consistent with expected signature
      fireEvent.press(getByTestId("simulate-select-btn"));
      await Promise.resolve();
    });

    const drawnDisplay = await findByTestId("mock-drawn-cards");
    expect(drawnDisplay).toBeTruthy();
  });

  it("should hide DrawnCardsDisplay on dismiss", async () => {
    jest.useFakeTimers();
    const { getByText, findByTestId, getByTestId, queryByTestId } = render(
      <ThreeCardsScreen />
    );
    await act(async () => {
      fireEvent.press(getByText("Start"));
      await Promise.resolve();
    });

    await findByTestId("mock-card-stack");
    await act(async () => {
      fireEvent.press(getByTestId("simulate-select-btn"));
      await Promise.resolve();
    });
    await findByTestId("mock-drawn-cards");

    await act(async () => {
      fireEvent.press(getByTestId("dismiss-explanation-btn"));
      await jest.advanceTimersByTimeAsync(300);
    });

    await waitFor(() => expect(queryByTestId("mock-drawn-cards")).toBeNull());
    jest.useRealTimers();
  });

  it("should show SummaryView when 3 cards are selected", async () => {
    jest.useFakeTimers();
    const { getByText, getByTestId, findByTestId, queryByTestId } = render(
      <ThreeCardsScreen />
    );
    await act(async () => {
      fireEvent.press(getByText("Start"));
      await Promise.resolve();
    });

    const pressSimulate = async () => {
      // Ensure stack exists before trying to press button
      await findByTestId("mock-card-stack");
      fireEvent.press(getByTestId("simulate-select-btn"));
      await Promise.resolve();
      await findByTestId("mock-drawn-cards");
      fireEvent.press(getByTestId("dismiss-explanation-btn"));
      await jest.advanceTimersByTimeAsync(300);
      await waitFor(() => expect(queryByTestId("mock-drawn-cards")).toBeNull());
    };

    // Wait for stack initially
    await findByTestId("mock-card-stack");
    await act(async () => {
      await pressSimulate();
    }); // Round 1
    await act(async () => {
      await pressSimulate();
    }); // Round 2

    // Round 3 -> Summary
    await act(async () => {
      // Ensure stack exists before trying to press button (might have been removed temporarily)
      await findByTestId("mock-card-stack");
      fireEvent.press(getByTestId("simulate-select-btn"));
      await Promise.resolve();
    });

    const summaryView = await findByTestId("mock-summary-view");
    expect(summaryView).toBeTruthy();
    jest.useRealTimers();
  });

  it("should reset state when summary is dismissed", async () => {
    jest.useFakeTimers();
    const { getByText, getByTestId, findByTestId, queryByTestId } = render(
      <ThreeCardsScreen />
    );
    await act(async () => {
      fireEvent.press(getByText("Start"));
      await Promise.resolve();
    });

    const pressSimulate = async () => {
      // Ensure stack exists before trying to press button
      await findByTestId("mock-card-stack");
      fireEvent.press(getByTestId("simulate-select-btn"));
      await Promise.resolve();
      await findByTestId("mock-drawn-cards");
      fireEvent.press(getByTestId("dismiss-explanation-btn"));
      await jest.advanceTimersByTimeAsync(300);
      await waitFor(() => expect(queryByTestId("mock-drawn-cards")).toBeNull());
    };

    // Wait for stack initially
    await findByTestId("mock-card-stack");
    await act(async () => {
      await pressSimulate();
    }); // Round 1
    await act(async () => {
      await pressSimulate();
    }); // Round 2

    // Round 3 -> Summary
    await act(async () => {
      // Ensure stack exists before trying to press button
      await findByTestId("mock-card-stack");
      fireEvent.press(getByTestId("simulate-select-btn"));
      await Promise.resolve();
    });

    await findByTestId("mock-summary-view");
    // Dismiss summary
    await act(async () => {
      fireEvent.press(getByTestId("dismiss-summary-btn"));
      await Promise.resolve(); // Allow state update for reset
    });

    await waitFor(() => expect(getByText("Start")).toBeTruthy());
    jest.useRealTimers();
  });
});
