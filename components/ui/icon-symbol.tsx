// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  "house.fill": "home",
  "chart.bar.fill": "bar-chart",
  "gearshape.fill": "settings",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "play.fill": "play-arrow",
  "pause.fill": "pause",
  "stop.fill": "stop",
  "plus": "add",
  "xmark": "close",
  "checkmark": "check",
  "clock.fill": "access-time",
  "bolt.fill": "bolt",
  "leaf.fill": "eco",
  "moon.fill": "dark-mode",
  "sun.max.fill": "light-mode",
  "bell.fill": "notifications",
  "arrow.up.doc.fill": "upload-file",
  "arrow.down.doc.fill": "file-download",
  "arrow.clockwise": "sync",
  "wind": "air",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
