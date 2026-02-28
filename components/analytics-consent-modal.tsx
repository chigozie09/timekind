import React, { useState } from "react";
import { Modal, View, Text, ScrollView, Pressable } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface AnalyticsConsentModalProps {
  visible: boolean;
  onConsent: () => void;
  onDecline: () => void;
}

/**
 * Analytics Consent Modal
 * Displays privacy-friendly analytics explanation
 * User can opt-in or opt-out
 */
export function AnalyticsConsentModal({
  visible,
  onConsent,
  onDecline,
}: AnalyticsConsentModalProps) {
  const colors = useColors();
  const [isPressed, setIsPressed] = useState<"consent" | "decline" | null>(
    null
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDecline}
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
              Help Us Improve
            </Text>
            <Text
              className="text-sm"
              style={{ color: colors.muted }}
            >
              Optional analytics to help TimeKind get better
            </Text>
          </View>

          {/* Content */}
          <ScrollView className="max-h-64 gap-4">
            <View className="gap-3">
              <Text
                className="text-base font-semibold"
                style={{ color: colors.foreground }}
              >
                What we track:
              </Text>
              <View className="gap-2 pl-4">
                <Text
                  className="text-sm"
                  style={{ color: colors.muted }}
                >
                  • Feature usage (which screens you visit)
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.muted }}
                >
                  • Task completion patterns
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.muted }}
                >
                  • App crashes and errors
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.muted }}
                >
                  • Settings preferences
                </Text>
              </View>

              <Text
                className="text-base font-semibold mt-2"
                style={{ color: colors.foreground }}
              >
                What we don't track:
              </Text>
              <View className="gap-2 pl-4">
                <Text
                  className="text-sm"
                  style={{ color: colors.muted }}
                >
                  • Your task content or names
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.muted }}
                >
                  • Personal information
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
                  • Any data is sent to external servers
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
                All analytics data is stored locally on your device. You can disable analytics anytime in Settings. You can request to see or delete your analytics data at any time.
              </Text>
            </View>
          </ScrollView>

          {/* Buttons */}
          <View className="gap-3 mt-4">
            <Pressable
              onPress={() => {
                setIsPressed("consent");
                setTimeout(onConsent, 100);
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
                Yes, Help Improve TimeKind
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setIsPressed("decline");
                setTimeout(onDecline, 100);
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
