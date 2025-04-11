// components/__tests__/SummaryView.test.tsx
// --- Mocks moved to jest.setup.js ---

// --- Imports ---
import React from "react";
import { render, waitFor, screen } from "@testing-library/react-native";
import SummaryView from "../SummaryView"; // Import the component under test
import { fetchAndProcessTarotSummary } from "@/services/apiService";
import { ISelectedAndShownCard } from "@/constants/tarotcards";
import { bugsnagService } from "@/services/bugsnag"; // Import bugsnagService

// --- Mock Dependencies ---
// Mock the service function used by the hook
jest.mock("@/services/apiService");

// Mock Bugsnag (indirect dependency via the hook)
jest.mock("@/services/bugsnag", () => ({
  bugsnagService: { notify: jest.fn(), leaveBreadcrumb: jest.fn() },
}));

// Mock useScrollEndDetection as it influences button visibility,
// but we don't need its complex logic for these tests.
jest.mock("@/hooks/useScrollEndDetection", () => ({
  useScrollEndDetection: () => ({
    hasScrolledToEnd: true, // Assume scrolled to end for simplicity
    handleScroll: jest.fn(),
  }),
}));

// --- Mock Data ---
const mockCard1: ISelectedAndShownCard = {
  id: "card-1",
  name: "The Fool",
  image: 1,
  showFront: true,
  isSelected: true,
  onNextCard: jest.fn(),
};
const mockCards = [mockCard1];
const mockDismissFn = jest.fn();

describe("SummaryView Component", () => {
  // Typed reference to the mocked service function
  const mockedFetchHelper = fetchAndProcessTarotSummary as jest.MockedFunction<
    typeof fetchAndProcessTarotSummary
  >;
  // Reference to the Bugsnag mock if needed for assertions
  const mockedBugsnagNotify = bugsnagService.notify as jest.Mock;

  beforeEach(() => {
    // Clear mocks before each test
    mockedFetchHelper.mockClear();
    mockedBugsnagNotify.mockClear();
    mockDismissFn.mockClear();
  });

  it("should display loading indicator initially", () => {
    // Prevent the promise from resolving immediately
    mockedFetchHelper.mockReturnValue(new Promise(() => {}));
    render(<SummaryView cards={mockCards} onDismiss={mockDismissFn} />);

    // Check for the ActivityIndicator by role or by checking summary/error absence
    // Option 1: Check role (more robust if supported)
    // expect(screen.getByRole("progressbar")).toBeTruthy();
    // Option 2: Check absence of other elements (simpler)
    expect(screen.queryByText(/summary/i)).toBeNull();
    expect(screen.queryByText(/error/i)).toBeNull();
    // Check that the main title IS present, confirming render started
    expect(screen.getByText("Deine Kartenlegung")).toBeTruthy();
  });

  it("should display summary text after successful fetch", async () => {
    const mockResult = { summary: "This is the final summary.", error: null };
    mockedFetchHelper.mockResolvedValue(mockResult);
    render(<SummaryView cards={mockCards} onDismiss={mockDismissFn} />);

    // Wait for the summary text to appear
    const summaryElement = await screen.findByText(mockResult.summary);
    expect(summaryElement).toBeTruthy();

    // Check that loading indicator is gone (indirectly by checking summary presence)
    // Check that no error text is displayed using a general pattern
    expect(screen.queryByText(/error|fehler/i)).toBeNull();
  });

  it("should display error message if fetch resolves with an error", async () => {
    const mockResult = {
      summary: null,
      error: "Something went wrong from API",
    };
    mockedFetchHelper.mockResolvedValue(mockResult);
    render(<SummaryView cards={mockCards} onDismiss={mockDismissFn} />);

    // Wait for the error message to appear
    const errorElement = await screen.findByText(mockResult.error);
    expect(errorElement).toBeTruthy();

    // Check that loading indicator is gone (indirectly by checking error presence)
    // Check that no summary text is displayed (use a specific query, not /.+/)
    expect(screen.queryByText(/.summary/i)).toBeNull(); // Example, adjust if needed
    // Verify the error text is the only main text besides title/button
    const allTextElements = screen.queryAllByText(/.+/);
    // Filter out known texts like title and button (adjust button text if different)
    const unexpectedTexts = allTextElements.filter((el) => {
      const children = el.props.children;
      // Check if children is the specific array for the label
      const isLabelArray =
        Array.isArray(children) &&
        children.length === 3 &&
        children[0] === "(" &&
        children[1] === "Gegenwart" &&
        children[2] === ")";

      return (
        children !== "Deine Kartenlegung" &&
        children !== mockResult.error &&
        children !== "Neue Legung beginnen" &&
        !isLabelArray && // Exclude the label array
        children !== "The Fool"
      );
    });
    expect(unexpectedTexts).toHaveLength(0);
  });

  it("should display generic error message if fetch rejects unexpectedly", async () => {
    const unexpectedError = new Error("Network failed");
    mockedFetchHelper.mockRejectedValue(unexpectedError); // Test promise rejection
    render(<SummaryView cards={mockCards} onDismiss={mockDismissFn} />);

    // Wait for the generic error message (set by the hook's catch block)
    const errorElement = await screen.findByText(
      "An unexpected error occurred during processing."
    );
    expect(errorElement).toBeTruthy();

    // Check that loading indicator is gone
    expect(screen.queryByTestId("loading-indicator")).toBeNull();
    // Check that Bugsnag was notified (indirectly via the hook)
    expect(mockedBugsnagNotify).toHaveBeenCalledTimes(1);
    expect(mockedBugsnagNotify).toHaveBeenCalledWith(
      new Error("Unexpected error in fetchAndProcessTarotSummary promise")
    );
  });

  // Optional: Test for empty card array (should show empty summary)
  it("should display empty summary for empty card array", async () => {
    const mockResultEmpty = { summary: "", error: null };
    mockedFetchHelper.mockResolvedValue(mockResultEmpty); // Helper returns this for []

    render(<SummaryView cards={[]} onDismiss={mockDismissFn} />);

    // Wait for loading to finish (button should appear as hasScrolledToEnd is true)
    await screen.findByText("Neue Legung beginnen");

    // Assert that no specific summary text or error is shown.
    const allTextElements = screen.queryAllByText(/.+/);
    // Filter out known texts (title, button)
    const unexpectedTexts = allTextElements.filter(
      (el) =>
        el.props.children !== "Deine Kartenlegung" &&
        el.props.children !== "Neue Legung beginnen"
    );
    expect(unexpectedTexts).toHaveLength(0);

    // Check that NO error text is present specifically
    expect(screen.queryByText(/error|fehler/i)).toBeNull();
    // Check fetch was still called
    expect(mockedFetchHelper).toHaveBeenCalledWith([]);
  });
});
