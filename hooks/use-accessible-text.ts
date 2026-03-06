import { useFontSize } from "@/lib/font-size-context";

export function useAccessibleText() {
  const { getFontSizeMultiplier, getLineHeightMultiplier } = useFontSize();

  const fontSizeMultiplier = getFontSizeMultiplier();
  const lineHeightMultiplier = getLineHeightMultiplier();

  /**
   * Get scaled font size based on user preference
   * @param baseSize - Base font size in pixels
   * @returns Scaled font size
   */
  const getScaledFontSize = (baseSize: number): number => {
    return Math.round(baseSize * fontSizeMultiplier);
  };

  /**
   * Get scaled line height based on user preference
   * @param baseHeight - Base line height multiplier (e.g., 1.5)
   * @returns Scaled line height
   */
  const getScaledLineHeight = (baseHeight: number): number => {
    return baseHeight * lineHeightMultiplier;
  };

  /**
   * Get Tailwind class name with adjusted font size
   * @param baseSizeClass - Base Tailwind size class (e.g., 'text-base')
   * @returns Adjusted size class based on multiplier
   */
  const getAdjustedTextClass = (baseSizeClass: string): string => {
    const multiplier = fontSizeMultiplier;

    // Map base sizes to adjusted sizes
    if (multiplier >= 1.25) {
      // Extra large: bump up 2 sizes
      const sizeMap: Record<string, string> = {
        "text-xs": "text-sm",
        "text-sm": "text-base",
        "text-base": "text-lg",
        "text-lg": "text-xl",
        "text-xl": "text-2xl",
        "text-2xl": "text-3xl",
        "text-3xl": "text-4xl",
        "text-4xl": "text-5xl",
      };
      return sizeMap[baseSizeClass] || baseSizeClass;
    } else if (multiplier >= 1.1) {
      // Large: bump up 1 size
      const sizeMap: Record<string, string> = {
        "text-xs": "text-xs",
        "text-sm": "text-sm",
        "text-base": "text-base",
        "text-lg": "text-lg",
        "text-xl": "text-xl",
        "text-2xl": "text-2xl",
        "text-3xl": "text-3xl",
        "text-4xl": "text-4xl",
      };
      return sizeMap[baseSizeClass] || baseSizeClass;
    }

    // Normal: no change
    return baseSizeClass;
  };

  return {
    fontSizeMultiplier,
    lineHeightMultiplier,
    getScaledFontSize,
    getScaledLineHeight,
    getAdjustedTextClass,
  };
}
