"use client";
import { createContext, useContext, ReactNode } from "react";

// Simplificado para usar solo Google Maps
interface MapProviderContextType {
  mapProvider: "google";
}

const MapProviderContext = createContext<MapProviderContextType | undefined>(undefined);

export function MapProviderContextProvider({ children }: { children: ReactNode }) {
  return (
    <MapProviderContext.Provider
      value={{
        mapProvider: "google",
      }}
    >
      {children}
    </MapProviderContext.Provider>
  );
}

export function useMapProvider() {
  const context = useContext(MapProviderContext);
  if (context === undefined) {
    throw new Error("useMapProvider must be used within a MapProviderContextProvider");
  }
  return context;
}
