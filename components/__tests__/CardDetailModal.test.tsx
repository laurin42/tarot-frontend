import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react-native";
import CardDetailModal from "../CardDetailModal";
import { ISelectedAndShownCard } from "@/constants/tarotCards";

// Mock React Native's Modal
let mockModalProps: any = {}; // To store props passed to the mock
jest.mock("react-native/Libraries/Modal/Modal", () => {
  const RN = jest.requireActual("react-native");
  const MockModal = ({ visible, children, onRequestClose, ...rest }: any) => {
    mockModalProps = { visible, children, onRequestClose, ...rest }; // Store props
    if (!visible) {
      return null; // Don't render children if not visible
    }
    // Render children within a View to allow querying
    // Add testID to the modal itself for easier targeting
    return (
      <RN.View testID="mock-modal-wrapper" {...rest}>
        {children}
      </RN.View>
    );
  };
  return MockModal;
});

// --- Updated Mock Data ---
const explanationText = "Detailed explanation for The Hermit.";
const mockCard: ISelectedAndShownCard = {
  id: "card-detail-test",
  name: "The Hermit",
  image: 9,
  showFront: true,
  isSelected: true,
  onNextCard: jest.fn(),
  explanation: explanationText, // Add explanation here
};
const mockOnClose = jest.fn();

describe("CardDetailModal Component", () => {
  beforeEach(() => {
    mockOnClose.mockClear();
    mockModalProps = {}; // Reset mock props storage
  });

  it("should not render content when isVisible is false", () => {
    render(
      <CardDetailModal
        isVisible={false}
        card={mockCard}
        onClose={mockOnClose}
      />
    );
    expect(screen.queryByTestId("mock-modal-wrapper")).toBeNull();
  });

  it("should render content when isVisible is true and card is provided", () => {
    render(
      <CardDetailModal isVisible={true} card={mockCard} onClose={mockOnClose} />
    );

    expect(screen.getByTestId("mock-modal-wrapper")).toBeTruthy();
    // Check for card name
    expect(screen.getByText(mockCard.name)).toBeTruthy();
    // Check for explanation text
    expect(screen.getByText(explanationText)).toBeTruthy();
    // Check for close button text
    expect(screen.getByText("Schließen")).toBeTruthy();
  });

  it("should render nothing if card prop is null, even if visible", () => {
    render(
      <CardDetailModal isVisible={true} card={null} onClose={mockOnClose} />
    );
    // The component itself returns null if card is null
    expect(screen.queryByTestId("mock-modal-wrapper")).toBeNull();
  });

  it("should call onClose when modal requests close (e.g., back button)", () => {
    render(
      <CardDetailModal isVisible={true} card={mockCard} onClose={mockOnClose} />
    );

    // Ensure onRequestClose was passed to the mocked Modal
    expect(mockModalProps.onRequestClose).toBeDefined();
    expect(typeof mockModalProps.onRequestClose).toBe("function");

    // Simulate the modal requesting close
    act(() => {
      if (mockModalProps.onRequestClose) {
        mockModalProps.onRequestClose();
      }
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when the close button is pressed", () => {
    render(
      <CardDetailModal isVisible={true} card={mockCard} onClose={mockOnClose} />
    );

    // Find the close button by its text
    const closeButton = screen.getByText("Schließen");
    expect(closeButton).toBeTruthy();

    // Press the button
    fireEvent.press(closeButton);

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
