import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type FontSizeScale = "normal" | "large" | "extra-large";
export type LineHeightScale = "normal" | "comfortable" | "spacious";

interface FontSizeContextType {
  fontSizeScale: FontSizeScale;
  lineHeightScale: LineHeightScale;
  setFontSizeScale: (scale: FontSizeScale) => Promise<void>;
  setLineHeightScale: (scale: LineHeightScale) => Promise<void>;
  getFontSizeMultiplier: () => number;
  getLineHeightMultiplier: () => number;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(
  undefined
);

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSizeScale, setFontSizeScaleState] = useState<FontSizeScale>(
    "normal"
  );
  const [lineHeightScale, setLineHeightScaleState] = useState<LineHeightScale>(
    "normal"
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedFontSize = (await AsyncStorage.getItem(
          "fontSizeScale"
        )) as FontSizeScale | null;
        const savedLineHeight = (await AsyncStorage.getItem(
          "lineHeightScale"
        )) as LineHeightScale | null;

        if (savedFontSize) setFontSizeScaleState(savedFontSize);
        if (savedLineHeight) setLineHeightScaleState(savedLineHeight);
      } catch (error) {
        console.error("Failed to load font size preferences:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadPreferences();
  }, []);

  const setFontSizeScale = async (scale: FontSizeScale) => {
    try {
      setFontSizeScaleState(scale);
      await AsyncStorage.setItem("fontSizeScale", scale);
    } catch (error) {
      console.error("Failed to save font size preference:", error);
    }
  };

  const setLineHeightScale = async (scale: LineHeightScale) => {
    try {
      setLineHeightScaleState(scale);
      await AsyncStorage.setItem("lineHeightScale", scale);
    } catch (error) {
      console.error("Failed to save line height preference:", error);
    }
  };

  const getFontSizeMultiplier = () => {
    switch (fontSizeScale) {
      case "normal":
        return 1;
      case "large":
        return 1.15;
      case "extra-large":
        return 1.3;
      default:
        return 1;
    }
  };

  const getLineHeightMultiplier = () => {
    switch (lineHeightScale) {
      case "normal":
        return 1;
      case "comfortable":
        return 1.2;
      case "spacious":
        return 1.4;
      default:
        return 1;
    }
  };

  if (!isLoaded) {
    return null; // Wait for preferences to load
  }

  return (
    <FontSizeContext.Provider
      value={{
        fontSizeScale,
        lineHeightScale,
        setFontSizeScale,
        setLineHeightScale,
        getFontSizeMultiplier,
        getLineHeightMultiplier,
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error("useFontSize must be used within FontSizeProvider");
  }
  return context;
}
