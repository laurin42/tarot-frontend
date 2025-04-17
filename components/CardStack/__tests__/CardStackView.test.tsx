import React from "react";
import { render } from "@testing-library/react-native";
import CardStackView from "../CardStackView";
import { useCardStack } from "@/context/CardStackContext";
import { useCardStackLogic } from "../useCardStackLogic";
import { ISelectedAndShownCard } from "@/constants/tarotCards";
// import { Text, View } from "react-native"; // Entferne diese Imports

// --- Mock für useCardStack ---
jest.mock("@/context/CardStackContext", () => ({
  useCardStack: jest.fn(),
}));
const mockUseCardStack = useCardStack as jest.Mock;

// --- Mock für useCardStackLogic ---
jest.mock("../useCardStackLogic", () => ({
  useCardStackLogic: jest.fn(),
}));
const mockUseCardStackLogic = useCardStackLogic as jest.Mock;

// --- Mock für Animated.Text (einfach) ---
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  const ActualReact = require("react");
  const { Text } = require("react-native");

  const MockAnimatedText = (props: any) =>
    ActualReact.createElement(Text, props);

  return {
    ...Reanimated,
    useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
    Text: MockAnimatedText,
  };
});

// --- Mock für AnimatedFanCard ---
jest.mock("../AnimatedFanCard", () => {
  // --- HIER View und Text requiren ---
  const { View, Text } = require("react-native");
  const React = require("react"); // React wird für JSX benötigt

  const MockAnimatedFanCard = ({ card }: { card: ISelectedAndShownCard }) =>
    // Jetzt sind View und Text hier bekannt
    React.createElement(
      View,
      { testID: `animated-fan-card-${card.id}` },
      React.createElement(Text, null, card.name)
    );
  return {
    __esModule: true,
    default: MockAnimatedFanCard,
  };
});
// --- Ende Mock für AnimatedFanCard ---

// --- Helper für Mock-Daten ---
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
const mockCardsArray = [mockCard1, mockCard2];

// Standard-Rückgabewerte für Mocks
const defaultMockLogicValues = {
  cards: [],
  showInstruction: false,
  cardTransforms: { value: {} },
  instructionOpacity: { value: 0 },
  handleCardSelect: jest.fn(),
  isCardSelected: false,
  animatingToPosition: false,
};

const defaultMockContextValues = {
  sessionStarted: false,
  predeterminedCards: [],
  currentRound: 0,
  selectCard: jest.fn(),
  cardDimensions: { width: 100, height: 160 },
  loading: false,
  error: null,
  drawnCards: [],
  startSession: jest.fn(),
  dismissSummary: jest.fn(),
};

// Basis-Props für CardStackView
const baseProps = {
  drawnSlotPositions: [{ x: 0, y: 0 }],
};

describe("<CardStackView />", () => {
  beforeEach(() => {
    mockUseCardStack.mockReturnValue(defaultMockContextValues);
    mockUseCardStackLogic.mockReturnValue(defaultMockLogicValues);
  });

  it("should render empty when session is not started", () => {
    mockUseCardStack.mockReturnValue({
      ...defaultMockContextValues,
      sessionStarted: false,
    });
    mockUseCardStackLogic.mockReturnValue({
      ...defaultMockLogicValues,
      cards: [],
      showInstruction: false,
    });

    const { queryByText } = render(<CardStackView {...baseProps} />);

    expect(queryByText("Bitte Karte wählen...")).toBeNull();
    // Annahme: AnimatedFanCard hat einen Test-Prop oder rendert den Namen
    expect(queryByText(mockCard1.name)).toBeNull();
    expect(queryByText(mockCard2.name)).toBeNull();
  });

  // --- Test 2: Session gestartet, Instruktion sichtbar ---
  it("should render cards and instruction when session started and instruction is shown", () => {
    mockUseCardStack.mockReturnValue({
      ...defaultMockContextValues,
      sessionStarted: true, // Session läuft
      predeterminedCards: mockCardsArray, // Karten im Context
    });
    mockUseCardStackLogic.mockReturnValue({
      ...defaultMockLogicValues,
      cards: mockCardsArray, // useCardStackLogic gibt Karten zurück
      showInstruction: true, // Instruktion soll angezeigt werden
    });

    const { getByText } = render(<CardStackView {...baseProps} />);

    // Instruktion ist sichtbar
    expect(getByText("Bitte Karte wählen...")).toBeTruthy();

    // Karten sind sichtbar (prüfen auf Namen oder Test-IDs)
    expect(getByText(mockCard1.name)).toBeTruthy();
    expect(getByText(mockCard2.name)).toBeTruthy();
    // Oder prüfen, ob die richtige Anzahl gerendert wird, wenn jede Karte den Namen enthält
    // expect(getAllByText(/Card \d/)).toHaveLength(mockCardsArray.length);
  });

  // --- Test 3: Karte ausgewählt/animierend, Instruktion unsichtbar ---
  it("should render nothing when instruction is hidden (e.g., card selected/animating)", () => {
    mockUseCardStack.mockReturnValue({
      ...defaultMockContextValues,
      sessionStarted: true, // Session läuft noch
      predeterminedCards: mockCardsArray,
    });
    mockUseCardStackLogic.mockReturnValue({
      ...defaultMockLogicValues,
      cards: mockCardsArray, // Logik-Hook hat die Karten noch
      showInstruction: false, // ABER Instruktion ist aus!
      isCardSelected: true, // Simuliert den Grund für showInstruction=false
    });

    const { queryByText } = render(<CardStackView {...baseProps} />);

    // Instruktion ist NICHT sichtbar
    expect(queryByText("Bitte Karte wählen...")).toBeNull();

    // Karten sind auch NICHT sichtbar
    expect(queryByText(mockCard1.name)).toBeNull();
    expect(queryByText(mockCard2.name)).toBeNull();
  });

  // Optional: Test für Props an AnimatedFanCard (komplexer)
  // it('should pass correct props to AnimatedFanCard', () => { ... });
});
