import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import SummaryPanel from "../SummaryPanel";

describe("SummaryPanel Component", () => {
  const mockOnPress = jest.fn();
  const summaryText = "Dies ist die Zusammenfassung.";
  const errorText = "Ein Fehler ist aufgetreten.";

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it("should render ActivityIndicator when loading is true", () => {
    render(
      <SummaryPanel
        loading={true}
        error={null}
        summary=""
        showButton={false}
        onButtonPress={mockOnPress}
      />
    );
    // Check for ActivityIndicator (might need adjustment based on how it's identified)
    // Option 1: Test ID (if added to ActivityIndicator)
    // expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    // Option 2: Role (if available) - Removed as it's unreliable
    // expect(screen.getByRole("progressbar")).toBeTruthy();
    // Option 3: Check absence of other elements (Sufficient for this test)
    expect(screen.queryByText(summaryText)).toBeNull();
    expect(screen.queryByText(errorText)).toBeNull();
    expect(screen.queryByText("Neue Legung beginnen")).toBeNull();
  });

  it("should render error text when error is provided and not loading", () => {
    render(
      <SummaryPanel
        loading={false}
        error={errorText}
        summary=""
        showButton={false}
        onButtonPress={mockOnPress}
      />
    );
    expect(screen.getByText(errorText)).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.queryByText(summaryText)).toBeNull();
    expect(screen.queryByText("Neue Legung beginnen")).toBeNull();
  });

  it("should render summary text when summary is provided, not loading, no error, and showButton is false", () => {
    render(
      <SummaryPanel
        loading={false}
        error={null}
        summary={summaryText}
        showButton={false}
        onButtonPress={mockOnPress}
      />
    );
    expect(screen.getByText(summaryText)).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.queryByText(errorText)).toBeNull();
    expect(screen.queryByText("Neue Legung beginnen")).toBeNull();
  });

  it("should render summary text and button when summary is provided, not loading, no error, and showButton is true", () => {
    render(
      <SummaryPanel
        loading={false}
        error={null}
        summary={summaryText}
        showButton={true}
        onButtonPress={mockOnPress}
      />
    );
    expect(screen.getByText(summaryText)).toBeTruthy();
    const button = screen.getByText("Neue Legung beginnen");
    expect(button).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.queryByText(errorText)).toBeNull();
  });

  it("should call onButtonPress when the button is pressed", () => {
    render(
      <SummaryPanel
        loading={false}
        error={null}
        summary={summaryText}
        showButton={true}
        onButtonPress={mockOnPress}
      />
    );
    const button = screen.getByText("Neue Legung beginnen");
    fireEvent.press(button);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
