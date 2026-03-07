import React from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import { requestReview, isAvailableAsync } from 'expo-store-review';
import { useColors } from '@/hooks/use-colors';

interface RatingPromptModalProps {
  visible: boolean;
  onDismiss: () => void;
  onRated: () => void;
}

export function RatingPromptModal({ visible, onDismiss, onRated }: RatingPromptModalProps) {
  const colors = useColors();

  const handleRate = async () => {
    try {
      if (await isAvailableAsync()) {
        await requestReview();
      }
    } catch (error) {
      console.error('Error requesting review:', error);
    }
    onRated();
  };

  const handleLater = () => {
    onDismiss();
  };

  const handleNever = () => {
    onRated();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-4">
        <View className="bg-surface rounded-2xl p-6 w-full max-w-sm gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Love TimeKind?</Text>
            <Text className="text-base text-muted">
              Help us improve by rating the app. Your feedback means a lot!
            </Text>
          </View>

          {/* Star emoji for visual appeal */}
          <View className="items-center py-2">
            <Text className="text-5xl">⭐</Text>
          </View>

          {/* Buttons */}
          <View className="gap-3">
            {/* Rate Now Button */}
            <TouchableOpacity
              onPress={handleRate}
              className="bg-primary py-3 rounded-lg items-center"
            >
              <Text className="text-white font-semibold text-base">Rate Now</Text>
            </TouchableOpacity>

            {/* Later Button */}
            <TouchableOpacity
              onPress={handleLater}
              className="bg-surface border border-border py-3 rounded-lg items-center"
            >
              <Text className="text-foreground font-semibold text-base">Ask Me Later</Text>
            </TouchableOpacity>

            {/* Never Button */}
            <TouchableOpacity
              onPress={handleNever}
              className="py-3 items-center"
            >
              <Text className="text-muted text-base">No Thanks</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
