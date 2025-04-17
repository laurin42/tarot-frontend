// app/(tabs)/__tests__/dailyCard.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import DailyCardScreen from "@/app/(tabs)/dailyCard"; // Importiere die Screen-Komponente
import { useDailyCard, UseDailyCardResult } from "@/hooks/useDailyCard"; // Importiere den Hook und seinen Typ
import { ISelectedAndShownCard } from "@/constants/tarotCards";

// --- Mocks ---

// Mock den useDailyCard Hook
// Wir erstellen eine Mock-Implementierung, die wir pro Test anpassen können
let mockUseDailyCardResult: UseDailyCardResult;
jest.mock("@/hooks/useDailyCard"); // Mock das Modul

// Mock die TarotCard Komponente
jest.mock("@/components/TarotCard", () => {
  const MockView = require("react-native").View;
  const MockText = require("react-native").Text;
  const MockTarotCard = (props: { card: ISelectedAndShownCard }) => (
    <MockView testID="tarot-card-mock">
      {/* Zeige den Namen an, um die richtige Karte zu identifizieren */}
      <MockText>{props.card?.name} (Mock)</MockText>
    </MockView>
  );
  MockTarotCard.displayName = "MockTarotCard";
  return MockTarotCard;
});

// Mock Dimensions (kann oft nützlich sein, auch wenn nicht direkt verwendet)
jest.mock("react-native/Libraries/Utilities/Dimensions", () => ({
  get: jest.fn().mockReturnValue({ width: 400, height: 800 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// --- Mock Data (für den Hook-Mock) ---
const mockCardData: ISelectedAndShownCard = {
  id: "daily-test-card",
  name: "The Hierophant",
  image: 5,
  explanation: "Tradition and guidance.",
  isSelected: false, // Typischerweise nicht relevant für Anzeige
  showFront: true,
  onNextCard: jest.fn(), // Nicht relevant für diesen Hook/Screen
};

describe("<DailyCardScreen /> Integration Test", () => {
  // Helper, um den Mock für useDailyCard vor jedem Test zu setzen
  const setupMockHook = (overrides: Partial<UseDailyCardResult> = {}) => {
    mockUseDailyCardResult = {
      card: null,
      explanation: "",
      loading: false,
      error: null,
      isDrawn: false,
      drawDailyCard: jest.fn(), // Wichtig: Mock die Funktion
      ...overrides,
    };
    // Weise die Mock-Implementierung zu
    (useDailyCard as jest.Mock).mockReturnValue(mockUseDailyCardResult);
  };

  beforeEach(() => {
    // Stelle sicher, dass Mocks sauber sind
    jest.clearAllMocks();
    // Setze einen Standard-Mock-Zustand zurück
    setupMockHook();
  });

  // --- Testfälle ---

  it("should render loading state", () => {
    setupMockHook({ loading: true, isDrawn: false }); // Hook gibt loading=true zurück
    render(<DailyCardScreen />);

    expect(screen.getByTestId("loading-indicator")).toBeTruthy(); // Suche nach ActivityIndicator
    expect(screen.getByText("Prüfe heutige Karte...")).toBeTruthy();
    // Stelle sicher, dass weder Button noch Karte sichtbar sind
    expect(screen.queryByText("Tageskarte ziehen")).toBeNull();
    expect(screen.queryByTestId("tarot-card-mock")).toBeNull();
  });

  it("should render error state", () => {
    const errorMessage = "Fehler beim Laden!";
    setupMockHook({ error: errorMessage }); // Hook gibt Fehler zurück
    render(<DailyCardScreen />);

    expect(screen.getByText(errorMessage)).toBeTruthy();
    expect(screen.getByText("Erneut versuchen")).toBeTruthy(); // Button sollte da sein
    // Stelle sicher, dass Ladeindikator und Karte nicht sichtbar sind
    expect(screen.queryByTestId("loading-indicator")).toBeNull();
    expect(screen.queryByTestId("tarot-card-mock")).toBeNull();
  });

  it("should call drawDailyCard when retry button is pressed in error state", () => {
    const errorMessage = "Fehler!";
    setupMockHook({ error: errorMessage });
    render(<DailyCardScreen />);

    // Find button by testID
    const retryButton = screen.getByTestId("retry-button");
    fireEvent.press(retryButton);

    expect(mockUseDailyCardResult.drawDailyCard).toHaveBeenCalledTimes(1);
  });

  it("should render initial state (not drawn)", () => {
    setupMockHook({ isDrawn: false, loading: false }); // Standardzustand nach Init
    render(<DailyCardScreen />);

    expect(
      screen.getByText("Du hast heute noch keine Tageskarte gezogen.")
    ).toBeTruthy();
    expect(screen.getByText("Deine Tageskarte")).toBeTruthy();
    // Stelle sicher, dass Ladeindikator und Karte nicht sichtbar sind
    expect(screen.queryByTestId("loading-indicator")).toBeNull();
    expect(screen.queryByTestId("tarot-card-mock")).toBeNull();
  });

  it("should call drawDailyCard when draw button is pressed", () => {
    setupMockHook({ isDrawn: false, loading: false });
    render(<DailyCardScreen />);

    // Find button by testID
    const drawButton = screen.getByTestId("draw-card-button");
    fireEvent.press(drawButton);

    expect(mockUseDailyCardResult.drawDailyCard).toHaveBeenCalledTimes(1);
  });

  it("should render the drawn card state", () => {
    setupMockHook({
      isDrawn: true,
      card: mockCardData,
      explanation: mockCardData.explanation,
      loading: false,
    });
    render(<DailyCardScreen />);

    // Prüfe Kartendetails
    expect(screen.getByText(mockCardData.name)).toBeTruthy(); // Titel
    expect(screen.getByTestId("tarot-card-mock")).toBeTruthy(); // Gemockte Karte
    expect(screen.getByText(`${mockCardData.name} (Mock)`)).toBeTruthy(); // Inhalt der gemockten Karte
    expect(screen.getByText(mockCardData.explanation!)).toBeTruthy(); // Erklärung

    // Stelle sicher, dass Button und Ladeindikator nicht sichtbar sind
    expect(screen.queryByTestId("draw-card-button")).toBeNull();
    expect(screen.queryByTestId("loading-indicator")).toBeNull();
  });

  it("should disable draw button while loading", () => {
    // Test 1: Initial loading state (not drawn, loading=true)
    setupMockHook({ isDrawn: false, loading: true });
    render(<DailyCardScreen />);
    expect(screen.getByTestId("loading-indicator")).toBeTruthy();
    expect(screen.getByText("Prüfe heutige Karte...")).toBeTruthy();
    // Ensure neither button is rendered
    expect(screen.queryByTestId("draw-card-button")).toBeNull();
    expect(screen.queryByTestId("retry-button")).toBeNull();

    // Test 2: Fehlerzustand, aber erneuter Versuch läuft (error=true, loading=true)
    setupMockHook({ error: "Some error", loading: true });
    render(<DailyCardScreen />);
    // Find button by testID and check if it's disabled using the matcher
    const retryButtonLoading = screen.getByTestId("retry-button");
    expect(retryButtonLoading).toBeDisabled();
    // Ensure the other button isn't rendered
    expect(screen.queryByTestId("draw-card-button")).toBeNull();
  });
});
