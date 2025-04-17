import React from "react";
import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
import ThreeCardsContent from "../app/(tabs)/threeCards";
import { ISelectedAndShownCard } from "@/constants/tarotCards";
import { CardStackProvider } from "@/context/CardStackContext";
import * as AnimationHook from "@/hooks/useCardSelectionAnimation";

// --- Mocks ---

// Mock for react-native (Dimensions)
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  RN.Dimensions = {
    get: jest.fn().mockReturnValue({ width: 400, height: 800 }),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
  // Mock Animated.Value for Opacity in threecards.tsx
  RN.Animated = {
    ...RN.Animated,
    Value: jest.fn(() => ({
      current: 0,
      setValue: jest.fn(),
      interpolate: jest.fn(() => 0),
    })),
    timing: jest.fn(() => ({
      start: jest.fn((callback) => {
        if (callback) callback({ finished: true });
      }),
    })),
  };
  return RN;
});

// Mock for localTarotPool
jest.mock("@/services/localTarotPool", () => ({
  getRandomLocalCardsWithExplanations: jest.fn(),
}));

// Mock for AnimatedFanCard
// Mockt the deepest interaction component to simulate clicks
jest.mock("@/components/CardStack/AnimatedFanCard", () => {
  const { TouchableOpacity } = require("react-native");
  const React = require("react");
  const MockAnimatedFanCard = ({
    card,
    handleCardSelect,
  }: {
    card: ISelectedAndShownCard;
    handleCardSelect: (card: ISelectedAndShownCard) => void;
  }) => (
    <TouchableOpacity
      testID={`fan-card-${card.id}`}
      onPress={() => handleCardSelect(card)}
    ></TouchableOpacity>
  );
  return {
    __esModule: true,
    default: MockAnimatedFanCard,
  };
});
// --- End of Mock for AnimatedFanCard ---

// Mock for useCardSelectionAnimation
let capturedOnCardPositioned: (() => void) | undefined;
const mockAnimateCardSelection = jest.fn(
  (
    selectedCard,
    cards,
    currentRound,
    drawnSlotPositions,
    cardDimensions,
    onComplete
  ) => {
    // simulate: animation completed, call onComplete and then onCardPositioned
    if (onComplete) {
      // important: return a state that has isSelected=true,
      // so the logic in useCardStackLogic continues correctly
      const finalState = { ...selectedCard, isSelected: true, showFront: true };
      onComplete(finalState);
    }
    // call onCardPositioned after short delay
    setTimeout(() => {
      if (capturedOnCardPositioned) {
        capturedOnCardPositioned();
      }
    }, 0);
  }
);

const mockUpdateAllCardTransforms = jest.fn();
const mockResetAnimations = jest.fn();
const mockShowInstruction = jest.fn();

// Mock the hook itself
jest.mock("@/hooks/useCardSelectionAnimation", () => ({
  useCardSelectionAnimation: jest.fn((onCardPositionedCallback) => {
    capturedOnCardPositioned = onCardPositionedCallback; // Callback speichern
    return {
      animateCardSelection: mockAnimateCardSelection,
      updateAllCardTransforms: mockUpdateAllCardTransforms,
      resetAnimations: mockResetAnimations,
      showInstruction: mockShowInstruction,
      cardTransforms: { value: {} }, // Mock Shared Value
      instructionOpacity: { value: 0 }, // Mock Shared Value
    };
  }),
  __esModule: true,
}));

// NEW: Mock for useScrollEndDetection
jest.mock("@/hooks/useScrollEndDetection", () => ({
  useScrollEndDetection: jest.fn(() => ({
    hasScrolledToEnd: true, // ensure button is always shown
    handleScroll: jest.fn(),
  })),
}));

// --- Mock-Data (adjust/reduce if needed) ---
const mockCard1: ISelectedAndShownCard = {
  id: "1",
  name: "Card 1",
  image: "img1.png",
  explanation: "Expl 1",
  isSelected: false,
  showFront: false,
  onNextCard: jest.fn(),
};
const mockCard2: ISelectedAndShownCard = {
  id: "2",
  name: "Card 2",
  image: "img2.png",
  explanation: "Expl 2",
  isSelected: false,
  showFront: false,
  onNextCard: jest.fn(),
};
const mockCard3: ISelectedAndShownCard = {
  id: "3",
  name: "Card 3",
  image: "img3.png",
  explanation: "Expl 3",
  isSelected: false,
  showFront: false,
  onNextCard: jest.fn(),
};
const mockPredeterminedCards = [mockCard1, mockCard2, mockCard3];

// Alias for Service-Mock
const mockGetRandomCards = jest.requireMock("@/services/localTarotPool")
  .getRandomLocalCardsWithExplanations as jest.Mock;

// --- Global Fetch Mock ---
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

// --- Render Helper with Provider ---
const renderWithProvider = (ui: React.ReactElement, options?: any) => {
  return render(<CardStackProvider>{ui}</CardStackProvider>, options);
};

// Helper function to select a card and dismiss the explanation
const selectCardAndDismissExplanation = async (
  {
    getByText,
    findByTestId,
    queryByText,
    findByText,
  }: ReturnType<typeof renderWithProvider>,
  cardId: string,
  cardName: string
) => {
  const cardToSelect = await findByTestId(`fan-card-${cardId}`);
  await act(async () => {
    fireEvent.press(cardToSelect);
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  await findByText("Schliessen");

  const dismissExplanationButton = getByText("Schliessen");
  await act(async () => {
    fireEvent.press(dismissExplanationButton);
    await new Promise((resolve) => setTimeout(resolve, 310));
  });
  // wait until DrawnCardsDisplay is gone (check on button and optional name)
  await waitFor(() => expect(queryByText("Schliessen")).toBeNull());
  await waitFor(() => expect(queryByText(cardName)).toBeNull()); // keep the check on the name here
  await findByText("Bitte Karte wählen...");
};

describe("<ThreeCardsContent /> Integration", () => {
  const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;

  beforeEach(() => {
    // Set environment variable for test
    process.env.EXPO_PUBLIC_API_URL = "http://mock-api.com";

    // Reset Fetch Mock and define responses
    mockFetch.mockClear();
    mockFetch.mockImplementation(async (url, options) => {
      const urlString = typeof url === "string" ? url : url.toString();
      // Mock for Summary
      if (urlString.endsWith("/tarot/summary") && options?.method === "POST") {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            summary: "Dies ist eine Test-Zusammenfassung.",
          }),
        });
      }
      // Mock for saveReadingSummary (called in background)
      if (
        urlString.endsWith("/tarot/reading-summary") &&
        options?.method === "POST"
      ) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, message: "Reading saved" }),
        });
      }
      // Standard answer for other callss (or throw error)
      return Promise.resolve({
        ok: false,
        status: 404,
        json: async () => ({ error: "Not Found" }),
      });
    });

    // Reset other mocks
    jest
      .requireMock("@/services/localTarotPool")
      .getRandomLocalCardsWithExplanations.mockClear()
      .mockResolvedValue([...mockPredeterminedCards]);

    // ... (Reset AnimationHook mocks etc.) ...
    mockAnimateCardSelection.mockClear();
    mockUpdateAllCardTransforms.mockClear();
    mockResetAnimations.mockClear();
    mockShowInstruction.mockClear();
    capturedOnCardPositioned = undefined;
    (AnimationHook.useCardSelectionAnimation as jest.Mock).mockImplementation(
      (onCardPositionedCallback) => {
        capturedOnCardPositioned = onCardPositionedCallback;
        return {
          animateCardSelection: mockAnimateCardSelection,
          updateAllCardTransforms: mockUpdateAllCardTransforms,
          resetAnimations: mockResetAnimations,
          showInstruction: mockShowInstruction,
          cardTransforms: { value: {} },
          instructionOpacity: { value: 0 },
        };
      }
    );
  });

  afterEach(() => {
    // Stelle die ursprüngliche Umgebungsvariable wieder her
    process.env.EXPO_PUBLIC_API_URL = originalApiUrl;
    jest.useRealTimers();
  });

  // --- Tests ---

  it("should render the Start button initially", () => {
    // use wrapper
    const { getByText, queryByText, queryByTestId } = renderWithProvider(
      <ThreeCardsContent />
    );
    expect(getByText("Start")).toBeTruthy();
    // check if cards/instruction are not rendered
    expect(queryByText("Bitte Karte wählen...")).toBeNull();
    expect(queryByTestId("fan-card-1")).toBeNull();
  });

  it("should show loading, then cards and instruction on Start press", async () => {
    const { getByText, findByText, queryByText, findByTestId } =
      renderWithProvider(<ThreeCardsContent />);

    fireEvent.press(getByText("Start"));

    // check if loading state is shown (can be short, hence findByText)
    expect(await findByText("Lade Karten...")).toBeTruthy();
    expect(await findByText("Bitte Karte wählen...")).toBeTruthy();

    // check if cards are rendered (over TestID from mock)
    expect(await findByTestId("fan-card-1")).toBeTruthy();
    expect(await findByTestId("fan-card-2")).toBeTruthy();
    expect(await findByTestId("fan-card-3")).toBeTruthy();
    expect(queryByText("Start")).toBeNull();
    expect(mockGetRandomCards).toHaveBeenCalledTimes(1);
  });

  // --- Test for card selection -> DrawnCardsDisplay ---
  it("should show DrawnCardsDisplay after a card is selected", async () => {
    const {
      getByText,
      findByTestId,
      findByText,
      queryByText: queryInstructionText,
      queryByTestId,
    } = renderWithProvider(<ThreeCardsContent />);

    // 1. Start Session & warte auf Karten
    fireEvent.press(getByText("Start"));
    const cardToSelect = await findByTestId("fan-card-1");
    await act(async () => {
      fireEvent.press(cardToSelect);
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(await findByText("Schliessen")).toBeTruthy();
    expect(queryInstructionText("Bitte Karte wählen...")).toBeNull();
    expect(queryByTestId("fan-card-2")).toBeNull();
  });

  // --- Test for DrawnCardsDisplay Dismiss ---
  it("should hide DrawnCardsDisplay and show CardStack again on dismiss", async () => {
    const {
      getByText,
      findByTestId,
      findByText: findByTextAsync,
      queryByText,
    } = renderWithProvider(<ThreeCardsContent />);
    const { waitFor } = require("@testing-library/react-native");

    fireEvent.press(getByText("Start"));
    const cardToSelect = await findByTestId("fan-card-1");
    await act(async () => {
      fireEvent.press(cardToSelect);
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    await findByTextAsync("Schliessen");

    const dismissButton = getByText("Schliessen");

    await act(async () => {
      fireEvent.press(dismissButton);
      await new Promise((resolve) => setTimeout(resolve, 310));
    });

    await waitFor(() => expect(queryByText("Schliessen")).toBeNull());
    await waitFor(() => expect(queryByText(mockCard1.name)).toBeNull());

    expect(await findByTextAsync("Bitte Karte wählen...")).toBeTruthy();
    expect(await findByTestId("fan-card-2")).toBeTruthy();
    expect(await findByTestId("fan-card-3")).toBeTruthy();
  });

  // --- Test for SummaryView ---
  it("should show SummaryView after the third card is selected", async () => {
    const renderResult = renderWithProvider(<ThreeCardsContent />);
    const {
      getByText,
      findByTestId,
      findByText: findByTextAsync,
      queryByText,
      queryByTestId,
    } = renderResult;

    // 1. start session
    fireEvent.press(getByText("Start"));
    await findByTextAsync("Bitte Karte wählen...");

    // 2. select first card and dismiss explanation
    await selectCardAndDismissExplanation(
      renderResult,
      mockCard1.id,
      mockCard1.name
    );

    // 3. select second card and dismiss explanation
    await selectCardAndDismissExplanation(
      renderResult,
      mockCard2.id,
      mockCard2.name
    );

    // 4. select third card (then SummaryView should be shown)
    const thirdCardToSelect = await findByTestId(`fan-card-${mockCard3.id}`);
    await act(async () => {
      fireEvent.press(thirdCardToSelect);
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(await findByTextAsync("Deine Kartenlegung")).toBeTruthy();

    // optional: check if cardstack is gone
    expect(queryByText("Bitte Karte wählen...")).toBeNull();
    expect(queryByTestId(`fan-card-${mockCard1.id}`)).toBeNull();
  });

  // --- last test: reset to initial state when SummaryView is dismissed ---
  it("should reset to initial state when SummaryView is dismissed", async () => {
    const renderResult = renderWithProvider(<ThreeCardsContent />);
    const { getByText, findByTestId, findByText, queryByText, queryByTestId } =
      renderResult;

    // 1. Kompletter Durchlauf bis zur SummaryView
    fireEvent.press(getByText("Start"));
    await findByText("Bitte Karte wählen...");
    await selectCardAndDismissExplanation(
      renderResult,
      mockCard1.id,
      mockCard1.name
    );
    await selectCardAndDismissExplanation(
      renderResult,
      mockCard2.id,
      mockCard2.name
    );
    const thirdCardToSelect = await findByTestId(`fan-card-${mockCard3.id}`);
    await act(async () => {
      fireEvent.press(thirdCardToSelect);
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(await findByText("Deine Kartenlegung")).toBeTruthy();
    expect(
      await findByText("Dies ist eine Test-Zusammenfassung.")
    ).toBeTruthy();

    const dismissSummaryButton = getByText("Neue Legung beginnen");

    await act(async () => {
      fireEvent.press(dismissSummaryButton);
    });

    expect(await findByText("Start")).toBeTruthy();
    expect(queryByText("Deine Kartenlegung")).toBeNull();
    expect(queryByText("Neue Legung beginnen")).toBeNull();
    expect(queryByText("Dies ist eine Test-Zusammenfassung.")).toBeNull();
    expect(queryByTestId(`fan-card-${mockCard1.id}`)).toBeNull();
  });
});
