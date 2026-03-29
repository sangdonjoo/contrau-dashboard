"use client";

import { createContext, useContext, useState } from "react";

interface FactoryContextValue {
  selectedFactoryId: string;
  setSelectedFactoryId: (id: string) => void;
}

const FactoryContext = createContext<FactoryContextValue>({
  selectedFactoryId: "TV1",
  setSelectedFactoryId: () => {},
});

export function FactoryProvider({ children }: { children: React.ReactNode }) {
  const [selectedFactoryId, setSelectedFactoryId] = useState("TV1");
  return (
    <FactoryContext.Provider value={{ selectedFactoryId, setSelectedFactoryId }}>
      {children}
    </FactoryContext.Provider>
  );
}

export function useFactory() {
  return useContext(FactoryContext);
}
