import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { loadSettings, updateSettings as saveSettings } from '@/lib/store';
import { getRatingMessage, handleRatingResponse } from '@/lib/app-rating';

export default function RatingPrompt() {
  const router = useRouter();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const handleRate = async (rating: number) => {
    setSelectedRating(rating);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    handleRatingResponse(rating, async (r) => {
      if (settings) {
        await saveSettings({
          ...settings,
          hasShownRatingPrompt: true,
          userRating: r,
        });
      }
      
      setTimeout(() => {
        router.back();
      }, 1000);
    });
  };

  if (!settings) return null;

  return (
    <ScreenContainer className="p-6 justify-center">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View className="gap-6">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-4xl font-bold text-foreground">Love TimeKind?</Text>
            <Text className="text-lg text-muted text-center">
              Your feedback helps us improve
            </Text>
          </View>

          {/* Rating Stars */}
          <View className="flex-row justify-center gap-3">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Pressable
                key={rating}
                onPress={() => handleRate(rating)}
                style={({ pressed }) => [
                  { transform: [{ scale: pressed ? 0.9 : 1 }] },
                ]}
              >
                <Text
                  className={`text-5xl ${
                    selectedRating && selectedRating >= rating
                      ? 'text-primary'
                      : 'text-border'
                  }`}
                >
                  ★
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Message */}
          {selectedRating && (
            <View className="bg-surface rounded-lg p-4">
              <Text className="text-base text-foreground text-center">
                {getRatingMessage(selectedRating)}
              </Text>
            </View>
          )}

          {/* Close Button */}
          <Pressable
            onPress={async () => {
              if (settings) {
                await saveSettings({
                  ...settings,
                  hasShownRatingPrompt: true,
                });
              }
              router.back();
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <Text className="text-center text-base text-muted">
              Maybe later
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
