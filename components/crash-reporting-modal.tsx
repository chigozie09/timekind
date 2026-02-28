import React, { useState } from "react";
import { Modal, View, Text, ScrollView, Pressable } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface CrashReportingModalProps {
  visible: boolean;
  onEnable: () => void;
  onDisable: () => void;
}

/**
 * Crash Reporting Consent Modal
 * Displays privacy-friendly crash reporting explanation
 * User can opt-in or opt-out
 */
export function CrashReportingModal({
  visible,
  onEnable,
  onDisable,
}: CrashReportingModalProps) {
  const colors = useColors();
  const [isPressed, setIsPressed] = useState<"enable" | "disable" | null>(null);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDisable}
    >
      <View
        className="flex-1 justify-center items-center bg-black/50 p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <View
          className="w-full max-w-sm rounded-2xl p-6 gap-4"
          style={{ backgroundColor: colors.surface }}
        >
          {/* Header */}
          <View className="gap-2">
            <Text
              className="text-2xl font-bold"
              style={{ color: colors.foreground }}
            >
              Help Us Fix Bugs
            </Text>
            <Text
              className="text-sm"
              style={{ color: colors.muted }}
            >
              Optional crash reporting to make TimeKind more reliable
            </Text>
          </View>

          {/* Content */}
          <ScrollView className="max-h-64 gap-4">
            <View className="gap-3">
              <Text
                className="text-base font-semibold"
                style={{ color: colors.foreground }}
              >
                What we collect:
              </Text>
              <View className="gap-2 pl-4">
                <Text
                  className="text-sm"
                  style={{ color: colors.muted }}
                >
                  • Error messages and stack traces
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.muted }}
                >
                  • Device type and OS version
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.muted }}
                >
                  • App version and build number
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.muted }}
                >
                  • Crash timestamp
                </Text>
              </View>

              <Text
                className="text-base font-semibold mt-2"
                style={{ color: colors.foreground }}
              >
                What we DON'T collect:
              </Text>
              <View className="gap-2 pl-4">
                <Text
                  className="text-sm"
                  style={{ color: colors.muted }}
                >
                  • Your task data or personal information
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.muted }}
                >
                  • Location or device identifiers
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.muted }}
                >
                  • Any identifying information
                </Text>
              </View>

              <Text
                className="text-base font-semibold mt-2"
                style={{ color: colors.foreground }}
              >
                Privacy:
              </Text>
              <Text
                className="text-sm"
                style={{ color: colors.muted }}
              >
                Crash reports are completely anonymous. We use them only to identify and fix bugs. You can disable crash reporting anytime in Settings.
              </Text>
            </View>
          </ScrollView>

          {/* Buttons */}
          <View className="gap-3 mt-4">
            <Pressable
              onPress={() => {
                setIsPressed("enable");
                setTimeout(onEnable, 100);
              }}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
              className="py-3 px-4 rounded-lg items-center"
            >
              <Text className="font-semibold text-white">
                Yes, Help Fix Bugs
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setIsPressed("disable");
                setTimeout(onDisable, 100);
              }}
              style={({ pressed }) => [
                {
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
              className="py-3 px-4 rounded-lg items-center border"
            >
              <Text
                className="font-semibold"
                style={{ color: colors.foreground }}
              >
                No Thanks
              </Text>
            </Pressable>
          </View>

          <Text
            className="text-xs text-center mt-2"
            style={{ color: colors.muted }}
          >
            You can change this anytime in Settings
          </Text>
        </View>
      </View>
    </Modal>
  );
}
