import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { ErrorDisplay } from "../ErrorDisplay"; // Adjust path if needed
import { APP_ROUTES } from "@/constants/routes"; // Adjust path if needed
import { toValidRoute } from "@/types/navigation"; // Adjust path if needed

// Mock expo-router's useRouter
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

describe("ErrorDisplay Component", () => {
  const errorMessage = "Something went wrong!";

  beforeEach(() => {
    mockReplace.mockClear(); // Clear mock calls before each test
  });

  it("renders the error message correctly", () => {
    render(<ErrorDisplay message={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeTruthy();
  });

  it("does not show the reload button by default", () => {
    render(<ErrorDisplay message={errorMessage} />);
    expect(screen.queryByText("Neu laden")).toBeNull();
  });

  it("shows the reload button when showReloadButton is true", () => {
    render(<ErrorDisplay message={errorMessage} showReloadButton={true} />);
    expect(screen.getByText("Neu laden")).toBeTruthy();
  });

  it("calls router.replace with the home route when reload button is pressed", () => {
    render(<ErrorDisplay message={errorMessage} showReloadButton={true} />);
    const reloadButton = screen.getByText("Neu laden");
    fireEvent.press(reloadButton);
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(toValidRoute(APP_ROUTES.HOME));
  });

  it("applies dark mode styles when darkMode is true", () => {
    const { getByText, getByTestId } = render(
      // Assuming parent View gets testID or check style directly
      <ErrorDisplay message={errorMessage} darkMode={true} />
    );
    // We can't easily check applied styles directly in RN testing without extra setup.
    // Instead, we rely on snapshot testing or visual regression testing.
    // For unit tests, we'll trust the component logic passes the prop.
    // A snapshot test will capture the different structure/styles if any.
    // Let's add a basic assertion that it renders.
    expect(getByText(errorMessage)).toBeTruthy();
  });

  // Snapshot test
  it("matches snapshot with default props", () => {
    const tree = render(<ErrorDisplay message={errorMessage} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("matches snapshot with reload button", () => {
    const tree = render(
      <ErrorDisplay message={errorMessage} showReloadButton={true} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("matches snapshot with dark mode", () => {
    const tree = render(
      <ErrorDisplay message={errorMessage} darkMode={true} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("matches snapshot with dark mode and reload button", () => {
    const tree = render(
      <ErrorDisplay
        message={errorMessage}
        showReloadButton={true}
        darkMode={true}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
