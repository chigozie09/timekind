import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useColors } from "@/hooks/use-colors";

const REFLECTION_PROMPTS = [
  "What surprised you about your time today?",
  "Which task took longer than expected and why?",
  "What did you do well today with your time?",
  "What would you do differently tomorrow?",
  "Did you notice any patterns in your energy levels?",
  "What helped you stay focused today?",
  "What distracted you the most?",
  "How did your estimates compare to reality?",
];

interface ReflectionPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reflection: string) => void;
}

export function ReflectionPromptModal({
  visible,
  onClose,
  onSubmit,
}: ReflectionPromptModalProps) {
  const colors = useColors();
  const [reflection, setReflection] = useState("");
  const [randomPrompt] = useState(
    REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)]
  );

  const handleSubmit = () => {
    if (reflection.trim()) {
      onSubmit(reflection);
      setReflection("");
    }
  };

  const handleSkip = () => {
    setReflection("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <View
          className="w-11/12 rounded-2xl p-6 gap-4"
          style={{ backgroundColor: colors.surface }}
        >
          <Text className="text-2xl font-bold text-foreground">
            Daily Reflection
          </Text>

          <Text
            className="text-base italic text-muted"
            style={{ color: colors.primary }}
          >
            "{randomPrompt}"
          </Text>

          <TextInput
            placeholder="Share your thoughts..."
            placeholderTextColor={colors.muted}
            value={reflection}
            onChangeText={setReflection}
            multiline
            numberOfLines={4}
            className="border rounded-lg p-3 text-foreground"
            style={{
              borderColor: colors.border,
              color: colors.foreground,
              backgroundColor: colors.background,
            }}
          />

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleSkip}
              className="flex-1 py-3 rounded-lg items-center"
              style={{ backgroundColor: colors.border }}
            >
              <Text className="font-semibold text-foreground">Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!reflection.trim()}
              className="flex-1 py-3 rounded-lg items-center"
              style={{
                backgroundColor: reflection.trim() ? colors.primary : colors.muted,
              }}
            >
              <Text className="font-semibold text-background">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
