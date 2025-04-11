// Remove Dimensions mock from here
// jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
//   get: jest.fn().mockReturnValue({ width: 400, height: 800 }),
//   set: jest.fn(),
//   addEventListener: jest.fn(),
//   removeEventListener: jest.fn(),
// }));

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ThreeCardsScreen from "../app/(tabs)/threecards"; // Adjust the path if necessary

// Basic mocks - may need more depending on component complexity
jest.mock("@/utils/tarotCardPool", () => ({
  getRandomDrawnCards: jest.fn().mockResolvedValue([]), // Mock API call
}));
// Modify the mock for CardStackView to render the text
jest.mock("@/components/CardStack", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text>CardStackView</Text>; // Simple component rendering the name
});
jest.mock("@/components/DrawnCardsDisplay", () => "DrawnCardsDisplay");
jest.mock("@/components/SummaryView", () => "SummaryView");

describe("<ThreeCardsScreen />", () => {
  it("should render the Start button initially", () => {
    const { getByText } = render(<ThreeCardsScreen />);

    // Check if the Start button is present
    expect(getByText("Start")).toBeTruthy();
  });

  // Add more tests later, e.g., for starting the session
  it("should start the session when the Start button is pressed", async () => {
    // Mock getRandomDrawnCards to resolve immediately for this test
    const mockGetRandomCards = jest.requireMock(
      "@/utils/tarotCardPool"
    ).getRandomDrawnCards;
    mockGetRandomCards.mockResolvedValue([
      {
        id: "1",
        name: "Test Card",
        isSelected: false,
        showFront: false,
        image: "",
      },
    ]);

    const { getByText, queryByText } = render(<ThreeCardsScreen />); // Use queryByText for non-existence check

    const startButton = getByText("Start");
    fireEvent.press(startButton);

    // Wait for the asynchronous state updates to complete and the button to disappear
    await waitFor(() => {
      expect(queryByText("Start")).toBeNull();
    });

    // Optional: Add assertion to check if loading indicator appears and disappears,
    // or if the mocked CardStackView appears.
    // const cardStack = await findByText('CardStackView'); // If not using testID
    // expect(cardStack).toBeTruthy();
  });

  it("should display CardStackView after starting the session", async () => {
    // Mock API call
    const mockGetRandomCards = jest.requireMock(
      "@/utils/tarotCardPool"
    ).getRandomDrawnCards;
    mockGetRandomCards.mockResolvedValue([
      {
        id: "1",
        name: "Test Card 1",
        isSelected: false,
        showFront: false,
        image: "",
      },
      {
        id: "2",
        name: "Test Card 2",
        isSelected: false,
        showFront: false,
        image: "",
      },
      {
        id: "3",
        name: "Test Card 3",
        isSelected: false,
        showFront: false,
        image: "",
      },
    ]);

    const { getByText, queryByText, findByText } = render(<ThreeCardsScreen />);

    // 1. Press Start
    const startButton = getByText("Start");
    fireEvent.press(startButton);

    // 2. Wait for Start button to disappear
    await waitFor(() => {
      expect(queryByText("Start")).toBeNull();
    });

    // 3. Check if the mocked CardStackView component appears
    // We are looking for the text content of the mocked component
    const cardStackView = await findByText("CardStackView");
    expect(cardStackView).toBeTruthy();
  });
});
