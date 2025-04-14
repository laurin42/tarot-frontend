import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import DynamicTarotCard from "../DynamicTarotCard"; // Pfad anpassen
import { getCardImageByName } from "../../constants/tarotCards";

// --- Mock-Daten (können hier bleiben) ---
const mockCardBackSource1 = "mock-card-back-1";
const mockCardBackSource2 = "mock-card-back-2";
const mockKnownCardSource = "mock-known-card-source";
const mockFallbackSource = mockCardBackSource1;

// --- Expliziter Mock mit relativem Pfad ---
jest.mock("../../constants/tarotcards", () => ({
  // Wichtig: __esModule: true, wenn das Originalmodul ES Modules verwendet (wahrscheinlich)
  __esModule: true,
  getCardImageByName: jest.fn((cardName: string) => {
    if (cardName === "Known Card") {
      return mockKnownCardSource;
    }
    console.warn(`MOCK: Keine Bildabbildung für Karte "${cardName}" gefunden`);
    return mockFallbackSource;
  }),
  CARD_BACK_IMAGES: [mockCardBackSource1, mockCardBackSource2],
  // Füge hier leere Mocks für andere Exporte hinzu, falls nötig
  tarotCards: [],
  ITarotCard: {},
  ISelectedAndShownCard: {},
}));

// --- Mock expo-image ---
// Mock implementation renders a View and passes props through for snapshot verification
jest.mock("expo-image", () => ({
  Image: jest.fn(({ style, source, contentFit, transition, ...rest }) => {
    const ReactActual = jest.requireActual("react");
    const ViewActual = jest.requireActual("react-native").View;
    // Include testID or other identifiable props based on source/style if needed
    // For simplicity, we pass source and style directly as props to the View
    return ReactActual.createElement(ViewActual, {
      style: style,
      testID: "mock-expo-image",
      "data-source": source, // Use data- attributes for custom props in snapshots
      "data-contentFit": contentFit,
      "data-transition": transition,
      ...rest,
    });
  }),
}));

// Cast zu jest.Mock für Typ-Sicherheit
const mockGetCardImageByNameImpl = getCardImageByName as jest.Mock;

// Mock console.warn
let consoleWarnSpy: jest.SpyInstance;

describe("DynamicTarotCard Component", () => {
  beforeEach(() => {
    // Verwende die gecastete Mock-Variable
    mockGetCardImageByNameImpl.mockClear();
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    // Kein Spy mehr auf getCardImageByName nötig, da wir den Mock direkt haben
  });

  it("renders front side correctly for a known card", async () => {
    render(<DynamicTarotCard cardName="Known Card" isShown={true} />);
    await waitFor(() => {
      expect(mockGetCardImageByNameImpl).toHaveBeenCalledWith("Known Card");
    });
    const tree = screen.toJSON();
    expect(tree).toMatchSnapshot();
    const image = screen.getByTestId("mock-expo-image");
    // Erwarte den einfachen Mock-String
    expect(image.props["data-source"]).toBe(mockKnownCardSource);
    expect(screen.getByText("Known Card")).toBeTruthy();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it("renders back side correctly with default index (0)", async () => {
    render(<DynamicTarotCard cardName="Any Card" isShown={false} />);
    await new Promise((res) => setImmediate(res));
    const tree = screen.toJSON();
    expect(tree).toMatchSnapshot();
    const image = screen.getByTestId("mock-expo-image");
    expect(mockGetCardImageByNameImpl).not.toHaveBeenCalled();
    expect(screen.queryByText("Any Card")).toBeNull();
  });

  it("renders back side correctly with specific index (1)", async () => {
    render(
      <DynamicTarotCard cardName="Any Card" isShown={false} cardBackIndex={1} />
    );
    await new Promise((res) => setImmediate(res));
    const tree = screen.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders back side with default index (0) if provided index is invalid", async () => {
    render(
      <DynamicTarotCard
        cardName="Any Card"
        isShown={false}
        cardBackIndex={99}
      />
    );
    await new Promise((res) => setImmediate(res));
    const tree = screen.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders fallback image (first back) for an unknown card when shown", async () => {
    render(<DynamicTarotCard cardName="Unknown Card" isShown={true} />);
    await waitFor(() => {
      expect(mockGetCardImageByNameImpl).toHaveBeenCalledWith("Unknown Card");
    });
    const tree = screen.toJSON();
    expect(tree).toMatchSnapshot();
    const image = screen.getByTestId("mock-expo-image");
    // Erwarte den einfachen Mock-String (Fallback)
    expect(image.props["data-source"]).toBe(mockFallbackSource);
    expect(screen.getByText("Unknown Card")).toBeTruthy();
    // Prüfe die Warnung aus der Mock-Implementierung
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'MOCK: Keine Bildabbildung für Karte "Unknown Card" gefunden'
    );
  });

  it("applies custom style correctly", async () => {
    const customStyle = { width: 200, height: 300, opacity: 0.5 };
    render(
      <DynamicTarotCard
        cardName="Known Card"
        isShown={true}
        style={customStyle}
      />
    );
    await waitFor(() => {
      expect(mockGetCardImageByNameImpl).toHaveBeenCalledWith("Known Card");
    });
    const tree = screen.toJSON();
    expect(tree).toMatchSnapshot();

    const stylesArray =
      tree && !Array.isArray(tree) && Array.isArray(tree.props.style)
        ? tree.props.style
        : [];
    expect(stylesArray).toEqual(
      expect.arrayContaining([expect.objectContaining(customStyle)])
    );
  });

  // Add tests for loading and error states if possible/needed
  // This might require more complex mocking of the useEffect or getCardImageByName
});
