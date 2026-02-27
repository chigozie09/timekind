import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import {
  KEYBOARD_SHORTCUTS,
  getShortcutDisplay,
} from "@/lib/keyboard-shortcuts";

export interface HelpOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export function HelpOverlay({ visible, onClose }: HelpOverlayProps) {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<"tips" | "shortcuts">("tips");

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View
          className="bg-background rounded-3xl w-full max-w-md max-h-[80%] border border-border"
          style={{ backgroundColor: colors.background }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center p-6 border-b border-border">
            <Text className="text-2xl font-bold text-foreground">
              Help & Tips
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-surface items-center justify-center"
            >
              <Text className="text-lg font-bold text-foreground">×</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View className="flex-row border-b border-border">
            <TouchableOpacity
              onPress={() => setActiveTab("tips")}
              className={`flex-1 py-4 items-center border-b-2 ${
                activeTab === "tips" ? "border-primary" : "border-transparent"
              }`}
            >
              <Text
                className={`font-semibold ${
                  activeTab === "tips"
                    ? "text-primary"
                    : "text-muted"
                }`}
              >
                Tips
              </Text>
            </TouchableOpacity>
            {Platform.OS !== "ios" && (
              <TouchableOpacity
                onPress={() => setActiveTab("shortcuts")}
                className={`flex-1 py-4 items-center border-b-2 ${
                  activeTab === "shortcuts"
                    ? "border-primary"
                    : "border-transparent"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    activeTab === "shortcuts"
                      ? "text-primary"
                      : "text-muted"
                  }`}
                >
                  Shortcuts
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <ScrollView className="flex-1 p-6">
            {activeTab === "tips" ? (
              <View className="gap-6">
                <TipCard
                  title="Estimate Generously"
                  description="Give yourself extra time. It's better to finish early than feel rushed."
                />
                <TipCard
                  title="Use Categories"
                  description="Organize tasks by type (Work, Health, Creative). Filter by category on the home screen."
                />
                <TipCard
                  title="Breathing Reset"
                  description="If a task takes longer than expected, use the breathing reset to recalibrate."
                />
                <TipCard
                  title="Streaks"
                  description="Streaks celebrate consistency, not perfection. One task per day keeps your streak alive."
                />
                <TipCard
                  title="Offline First"
                  description="All your data is stored locally. No internet needed. Export anytime for backup."
                />
                <TipCard
                  title="Accessibility"
                  description="Customize animations, sounds, and notifications in Settings to match your needs."
                />
              </View>
            ) : (
              <View className="gap-4">
                <Text className="text-sm text-muted mb-2">
                  Keyboard shortcuts for power users:
                </Text>
                {KEYBOARD_SHORTCUTS.map((shortcut) => (
                  <View
                    key={shortcut.action}
                    className="flex-row justify-between items-center p-3 bg-surface rounded-lg border border-border"
                  >
                    <Text className="text-sm text-foreground flex-1">
                      {shortcut.description}
                    </Text>
                    <View className="bg-primary rounded px-3 py-1">
                      <Text className="text-xs font-bold text-white">
                        {getShortcutDisplay(shortcut)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View className="p-6 border-t border-border">
            <TouchableOpacity
              onPress={onClose}
              className="bg-primary rounded-xl py-4 items-center"
            >
              <Text className="text-white text-lg font-bold">Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function TipCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View className="bg-surface rounded-lg p-4 border border-border">
      <Text className="text-base font-bold text-foreground mb-2">
        {title}
      </Text>
      <Text className="text-sm text-muted leading-relaxed">{description}</Text>
    </View>
  );
}
