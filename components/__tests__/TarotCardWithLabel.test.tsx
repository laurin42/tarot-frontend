import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import TarotCardWithLabel from "../TarotCardWithLabel";
import { ISelectedAndShownCard } from "@/constants/tarotCards";

// Mock child components to isolate the TarotCardWithLabel logic
jest.mock("@/components/DynamicTarotCard", () => {
  // Need to require react-native inside the mock factory
  const MockView = require("react-native").View;
  // Return a function component that renders a View with a testID
  return (props: any) => (
    <MockView testID="dynamic-tarot-card-mock" {...props} />
  );
});
jest.mock("react-native-shadow-2", () => ({
  Shadow: jest.fn(({ children }) => children), // Simple mock that renders children
}));

// --- Mock Data ---
const mockCard: ISelectedAndShownCard = {
  id: "card-test",
  name: "The Magician",
  image: 2, // Example image number
  showFront: true,
  isSelected: false,
  onNextCard: jest.fn(),
};

const mockOnPress = jest.fn();
const testIndex = 1;

describe("TarotCardWithLabel Component", () => {
  beforeEach(() => {
    mockOnPress.mockClear();
    // Mock Dimensions.get only if not already handled globally by jest-expo
    // (Assuming jest-expo provides a basic mock)
    // jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 375, height: 667, scale: 2, fontScale: 1 });
  });

  it("should render the card name correctly", () => {
    render(
      <TarotCardWithLabel
        card={mockCard}
        index={testIndex}
        onPress={mockOnPress}
      />
    );
    expect(screen.getByText(mockCard.name)).toBeTruthy();
  });

  // Removed test for the position label as it's no longer displayed
  // it('should render the correct position label', () => { ... });

  it("should render the DynamicTarotCard component", () => {
    render(
      <TarotCardWithLabel
        card={mockCard}
        index={testIndex}
        onPress={mockOnPress}
      />
    );
    // Check if the mocked component is present via testID
    expect(screen.getByTestId("dynamic-tarot-card-mock")).toBeTruthy();
  });

  it("should call onPress with the correct index when pressed", () => {
    render(
      <TarotCardWithLabel
        card={mockCard}
        index={testIndex}
        onPress={mockOnPress}
      />
    );

    // Find the mocked component via testID
    const cardElement = screen.getByTestId("dynamic-tarot-card-mock");
    // Fire press event on the element within the TouchableOpacity
    fireEvent.press(cardElement);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
    expect(mockOnPress).toHaveBeenCalledWith(testIndex);
  });

  // Optional Snapshot Test
  it("should match snapshot", () => {
    const tree = render(
      <TarotCardWithLabel
        card={mockCard}
        index={testIndex}
        onPress={mockOnPress}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
