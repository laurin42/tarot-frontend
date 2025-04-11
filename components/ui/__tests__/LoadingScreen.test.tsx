import React from "react";
import { render } from "@testing-library/react-native";
import { LoadingScreen } from "../LoadingScreen"; // Adjust path if needed

describe("LoadingScreen Component", () => {
  // The snapshot test inherently checks if the ActivityIndicator is rendered
  // as part of the component's output.
  it("renders correctly and matches snapshot", () => {
    const tree = render(<LoadingScreen />).toJSON();
    expect(tree).toMatchSnapshot();
    // By matching the snapshot, we implicitly confirm the ActivityIndicator
    // and the surrounding View structure are rendered as expected.
  });
});
