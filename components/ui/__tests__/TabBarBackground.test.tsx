import React from "react";
import { render } from "@testing-library/react-native";
import TabBarBackground from "@/components/ui/TabBarBackground";

describe("TabBarBackground Component", () => {
  it("renders correctly and matches snapshot", () => {
    const tree = render(<TabBarBackground />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
