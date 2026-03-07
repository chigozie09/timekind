import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';

export default function TermsOfService() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const openTerms = async () => {
    setLoading(true);
    try {
      await WebBrowser.openBrowserAsync('https://chigozie09.github.io/timekind-legal/terms-of-service');
    } catch (error) {
      console.error('Error opening terms of service:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-3xl font-bold text-foreground">Terms of Service</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-2xl text-muted">✕</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 items-center justify-center gap-6">
        <Text className="text-lg text-muted text-center leading-relaxed">
          Our terms of service are hosted online. Tap the button below to view them in your browser.
        </Text>

        <TouchableOpacity
          onPress={openTerms}
          disabled={loading}
          className="bg-primary px-8 py-4 rounded-full"
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-semibold text-lg">Open Terms of Service</Text>
          )}
        </TouchableOpacity>

        <Text className="text-xs text-muted text-center mt-4">
          https://chigozie09.github.io/timekind-legal/terms-of-service
        </Text>
      </View>
    </ScreenContainer>
  );
}
