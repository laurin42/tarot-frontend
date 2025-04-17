// components/CardStack/__tests__/useCardStackLogic.test.tsx
import { renderHook, act } from "@testing-library/react-native";
import { useCardStackLogic } from "../useCardStackLogic";
import { ISelectedAndShownCard } from "@/constants/tarotCards";
import * as AnimationHook from "@/hooks/useCardSelectionAnimation";

// Mock-Funktionen
const mockAnimateCardSelection = jest.fn();
const mockUpdateAllCardTransforms = jest.fn();
const mockResetAnimations = jest.fn();
const mockShowInstruction = jest.fn();
const mockCardTransforms = { value: {} };
const mockInstructionOpacity = { value: 0 };

// Objekt mit den Mock-Funktionen
const mockAnimationFunctions = {
  cardTransforms: mockCardTransforms,
  instructionOpacity: mockInstructionOpacity,
  animateCardSelection: mockAnimateCardSelection,
  updateAllCardTransforms: mockUpdateAllCardTransforms,
  resetAnimations: mockResetAnimations,
  showInstruction: mockShowInstruction,
};

// Mock das gesamte Modul
jest.mock("@/hooks/useCardSelectionAnimation", () => ({
  // Mocke den spezifischen Hook, der verwendet wird
  useCardSelectionAnimation: jest.fn(() => mockAnimationFunctions),
  // Stelle sicher, dass alle anderen Exporte des Moduls (falls vorhanden) auch gemockt werden,
  // z.B. Typen oder Konstanten. Hier vereinfacht, da wir nur den Hook brauchen.
  __esModule: true, // Wichtig für ES Modules
}));

// Mock-Karten mit allen benötigten Eigenschaften
const mockInitialCards: ISelectedAndShownCard[] = [
  {
    id: "1",
    name: "Card 1",
    isSelected: false,
    showFront: false,
    image: "img1.png",
    onNextCard: jest.fn(),
  },
  {
    id: "2",
    name: "Card 2",
    isSelected: false,
    showFront: false,
    image: "img2.png",
    onNextCard: jest.fn(),
  },
  {
    id: "3",
    name: "Card 3",
    isSelected: false,
    showFront: false,
    image: "img3.png",
    onNextCard: jest.fn(),
  },
];

// --- Angepasste Default Props für useCardStackLogic ---
// Entferne die explizite Typdefinition, lasse TypeScript inferieren
// type MockProps = Parameters<typeof useCardStackLogic>[0];

const defaultMockProps = {
  predeterminedCards: [] as ISelectedAndShownCard[], // expliziter Typ für leeres Array
  sessionStarted: false,
  currentRound: 0,
  drawnSlotPositions: [{ x: 10, y: 10 }],
  cardDimensions: { width: 100, height: 160 },
  spreadAngle: 60,
  selectCard: jest.fn(),
  onCardPositioned: jest.fn(),
  containerDimensions: { width: 400, height: 600 },
};

describe("useCardStackLogic", () => {
  beforeEach(() => {
    // Reset mocks
    (AnimationHook.useCardSelectionAnimation as jest.Mock).mockImplementation(
      () => mockAnimationFunctions
    );
    mockAnimateCardSelection.mockClear();
    mockUpdateAllCardTransforms.mockClear();
    mockResetAnimations.mockClear();
    mockShowInstruction.mockClear();
    // Jetzt können wir .mockClear() sicher aufrufen
    defaultMockProps.selectCard.mockClear();
    defaultMockProps.onCardPositioned.mockClear();
    // Mock-Werte zurücksetzen
  });

  // --- Tests ---

  it("should initialize with default state when session not started", () => {
    // Korrigierter renderHook Aufruf
    const { result } = renderHook((props) => useCardStackLogic(props), {
      initialProps: defaultMockProps,
    });

    expect(result.current.cards).toEqual([]);
    expect(result.current.isCardSelected).toBe(false);
    expect(result.current.animatingToPosition).toBe(false);
    expect(result.current.showInstruction).toBe(false);
    expect(result.current.cardTransforms).toBe(mockCardTransforms);
    expect(result.current.instructionOpacity).toBe(mockInstructionOpacity);
    expect(mockUpdateAllCardTransforms).not.toHaveBeenCalled();
    expect(mockShowInstruction).not.toHaveBeenCalled();
    expect(mockResetAnimations).toHaveBeenCalledTimes(1);
  });

  it("should set cards, update transforms, and show instruction when session starts", () => {
    // Korrigierter renderHook Aufruf
    const { result, rerender } = renderHook(
      (props) => useCardStackLogic(props),
      { initialProps: defaultMockProps }
    );

    const startedProps = {
      ...defaultMockProps,
      sessionStarted: true,
      predeterminedCards: mockInitialCards,
    };

    rerender(startedProps);

    expect(result.current.cards).toEqual(mockInitialCards);
    expect(result.current.isCardSelected).toBe(false);
    expect(result.current.animatingToPosition).toBe(false);
    expect(result.current.showInstruction).toBe(true);

    expect(mockUpdateAllCardTransforms).toHaveBeenCalledTimes(1);
    expect(mockUpdateAllCardTransforms).toHaveBeenCalledWith(
      mockInitialCards,
      true,
      startedProps.spreadAngle,
      startedProps.cardDimensions
    );
    expect(mockShowInstruction).toHaveBeenCalledTimes(1);
  });

  it("should clear cards and reset animations when session ends", () => {
    const startedProps = {
      ...defaultMockProps,
      sessionStarted: true,
      predeterminedCards: mockInitialCards,
    };
    // Korrigierter renderHook Aufruf
    const { result, rerender } = renderHook(
      (props) => useCardStackLogic(props),
      { initialProps: startedProps }
    );

    mockUpdateAllCardTransforms.mockClear();
    mockShowInstruction.mockClear();

    const stoppedProps = {
      ...startedProps,
      sessionStarted: false,
      predeterminedCards: [],
    };

    rerender(stoppedProps);

    expect(result.current.cards).toEqual([]);
    expect(result.current.isCardSelected).toBe(false);
    expect(result.current.animatingToPosition).toBe(false);
    expect(result.current.showInstruction).toBe(false);

    expect(mockResetAnimations).toHaveBeenCalledTimes(1);
    expect(mockUpdateAllCardTransforms).not.toHaveBeenCalled();
    expect(mockShowInstruction).not.toHaveBeenCalled();
  });

  it("should handle card selection correctly when session started", () => {
    const startedProps = {
      ...defaultMockProps,
      sessionStarted: true,
      predeterminedCards: mockInitialCards,
    };
    // Korrigierter renderHook Aufruf
    const { result } = renderHook((props) => useCardStackLogic(props), {
      initialProps: startedProps,
    });

    const cardToSelect = mockInitialCards[1];

    act(() => {
      result.current.handleCardSelect(cardToSelect);
    });

    expect(result.current.isCardSelected).toBe(true);
    expect(result.current.animatingToPosition).toBe(true);
    expect(result.current.showInstruction).toBe(false);

    expect(mockAnimateCardSelection).toHaveBeenCalledTimes(1);
    expect(mockAnimateCardSelection).toHaveBeenCalledWith(
      cardToSelect,
      mockInitialCards,
      startedProps.currentRound,
      startedProps.drawnSlotPositions,
      startedProps.cardDimensions,
      expect.any(Function)
    );

    const animationCallback = mockAnimateCardSelection.mock.calls[0][5];
    const finalCardStateFromAnimation = {
      ...cardToSelect,
      isSelected: true,
      showFront: true,
    };
    act(() => {
      animationCallback(finalCardStateFromAnimation);
    });

    expect(defaultMockProps.selectCard).toHaveBeenCalledTimes(1);
    expect(defaultMockProps.selectCard).toHaveBeenCalledWith(
      finalCardStateFromAnimation
    );
    expect(result.current.animatingToPosition).toBe(false);
    expect(result.current.isCardSelected).toBe(true);
    expect(result.current.showInstruction).toBe(false);
  });

  it("should NOT handle card selection if session not started", () => {
    const { result } = renderHook((props) => useCardStackLogic(props), {
      initialProps: defaultMockProps,
    });

    // Corrected mock card with all props
    const cardToSelect: ISelectedAndShownCard = {
      id: "1",
      name: "Test",
      isSelected: false,
      showFront: false,
      image: "test.png",
      onNextCard: jest.fn(),
    };

    act(() => {
      result.current.handleCardSelect(cardToSelect);
    });

    expect(result.current.isCardSelected).toBe(false);
    expect(result.current.animatingToPosition).toBe(false);
    expect(mockAnimateCardSelection).not.toHaveBeenCalled();
    expect(defaultMockProps.selectCard).not.toHaveBeenCalled();
  });

  it("should NOT handle card selection if card is already selected", () => {
    const startedProps = {
      ...defaultMockProps,
      sessionStarted: true,
      predeterminedCards: mockInitialCards,
    };
    // Korrigierter renderHook Aufruf
    const { result } = renderHook((props) => useCardStackLogic(props), {
      initialProps: startedProps,
    });

    const cardToSelect = mockInitialCards[0];

    act(() => {
      result.current.handleCardSelect(cardToSelect);
    });
    const animationCallback = mockAnimateCardSelection.mock.calls[0][5];
    const finalCardStateFromAnimation = {
      ...cardToSelect,
      isSelected: true,
      showFront: true,
    };
    act(() => {
      animationCallback(finalCardStateFromAnimation);
    });

    mockAnimateCardSelection.mockClear();
    defaultMockProps.selectCard.mockClear();

    act(() => {
      result.current.handleCardSelect(cardToSelect);
    });

    expect(mockAnimateCardSelection).not.toHaveBeenCalled();
    expect(defaultMockProps.selectCard).not.toHaveBeenCalled();
    expect(result.current.isCardSelected).toBe(true);
    expect(result.current.animatingToPosition).toBe(false);
  });

  it("should NOT handle card selection if another card is currently animating to position", () => {
    const startedProps = {
      ...defaultMockProps,
      sessionStarted: true,
      predeterminedCards: mockInitialCards,
    };
    // Korrigierter renderHook Aufruf
    const { result } = renderHook((props) => useCardStackLogic(props), {
      initialProps: startedProps,
    });

    const firstCardToSelect = mockInitialCards[0];
    const secondCardToSelect = mockInitialCards[1];

    act(() => {
      result.current.handleCardSelect(firstCardToSelect);
    });

    expect(result.current.isCardSelected).toBe(true);
    expect(result.current.animatingToPosition).toBe(true);
    expect(mockAnimateCardSelection).toHaveBeenCalledTimes(1);
    mockAnimateCardSelection.mockClear();

    act(() => {
      result.current.handleCardSelect(secondCardToSelect);
    });

    expect(mockAnimateCardSelection).not.toHaveBeenCalled();
    expect(result.current.isCardSelected).toBe(true);
    expect(result.current.animatingToPosition).toBe(true);
  });
});
