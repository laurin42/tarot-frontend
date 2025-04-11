import React from "react";
import { render } from "@testing-library/react-native";
import { IconSymbol } from "../IconSymbol"; // Adjust path if needed

describe("IconSymbol Component", () => {
  const testSymbolName = "star.fill"; // Use a valid symbol name string directly
  const defaultColor = "black"; // Define a default color for required prop

  it("renders correctly with default props and matches snapshot", () => {
    const tree = render(
      <IconSymbol name={testSymbolName} color={defaultColor} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with custom color and matches snapshot", () => {
    const tree = render(
      <IconSymbol name={testSymbolName} color="blue" />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with custom size and matches snapshot", () => {
    const tree = render(
      <IconSymbol name={testSymbolName} size={40} color={defaultColor} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with custom color and size and matches snapshot", () => {
    const tree = render(
      <IconSymbol name={testSymbolName} color="red" size={30} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with weight prop and matches snapshot", () => {
    const tree = render(
      <IconSymbol name={testSymbolName} weight="bold" color={defaultColor} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with all valid props and matches snapshot", () => {
    const tree = render(
      <IconSymbol
        name={testSymbolName}
        size={25}
        weight="semibold"
        color="purple"
        style={{ margin: 5 }} // Add a style test
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
