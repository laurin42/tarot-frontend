import React from "react";
import { render } from "@testing-library/react-native";
import TarotCard from "../../../components/TarotCard";
import { ISelectedAndShownCard } from "@/constants/tarotCards";

const mockCardData: ISelectedAndShownCard = {
  id: "test-card-1",
  name: "Test Card",
  image: "test-image",
  isSelected: false,
  onNextCard: jest.fn(),
};

const mockAnimatedStyle = {
  transform: [{ translateX: 10 }, { translateY: 20 }, { rotate: "5deg" }],
  opacity: 0.8,
  zIndex: 5,
};

describe("TarotCard Component", () => {
  it("renders correctly with card data and matches snapshot", () => {
    const tree = render(
      <TarotCard card={mockCardData} animatedStyle={mockAnimatedStyle} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly with card data and animatedStyle and matches snapshot", () => {
    const tree = render(
      <TarotCard card={mockCardData} animatedStyle={mockAnimatedStyle} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("renders correctly when showFront is false and matches snapshot", () => {
    const cardBackData = { ...mockCardData, showFront: false };
    const tree = render(
      <TarotCard card={cardBackData} animatedStyle={mockAnimatedStyle} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
