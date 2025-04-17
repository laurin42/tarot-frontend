import React, { createContext, useContext } from "react";
import { useCardSessionManagement } from "@/hooks/useCardSessionManagement";

// Passe den Typ an das Rückgabeobjekt des Hooks an
type CardSessionContextType = ReturnType<typeof useCardSessionManagement>;

const CardStackContext = createContext<CardSessionContextType | undefined>(
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
  const cardSession = useCardSessionManagement(); // Hook aufrufen

  return (
    <CardStackContext.Provider value={cardSession}>
      {/* hook dependencies are passed here */}
      {children}
    </CardStackContext.Provider>
  );
};
