import React, { createContext, useContext } from "react";

interface CardStackContextType {
  cards: Array<{
    id: number;
    isSelected: boolean;
    isShown: boolean;
  }>;
  spreadAngle: number;
  cardDimensions: {
    width: number;
    height: number;
  };
  sessionStarted: boolean;
  handleCardSelect: (card: any) => void;
}

const CardStackContext = createContext<CardStackContextType | undefined>(
  undefined
);

export const useCardStack = () => {
  const context = useContext(CardStackContext);
  if (!context) {
    throw new Error("useCardStack must be used within a CardStackProvider");
  }
  return context;
};

export const CardStackProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <CardStackContext.Provider
      value={{
        cards: [],
        spreadAngle: 30,
        cardDimensions: { width: 100, height: 160 },
        sessionStarted: false,
        handleCardSelect: () => {},
      }}
    >
      {children}
    </CardStackContext.Provider>
  );
};
