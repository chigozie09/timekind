import React, { useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';

export default function TermsOfService() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  return (
    <ScreenContainer className="p-0">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-surface border-b border-border px-4 py-3 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary text-lg font-semibold">← Back</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-foreground">Terms of Service</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Web View */}
        <WebView
          source={{ uri: 'https://chigozie09.github.io/timekind-legal/terms-of-service' }}
          onLoadEnd={() => setLoading(false)}
          style={{ flex: 1 }}
          startInLoadingState={true}
          renderLoading={() => (
            <View className="flex-1 items-center justify-center bg-background">
              <ActivityIndicator size="large" color="#0a7ea4" />
              <Text className="text-muted mt-4">Loading...</Text>
            </View>
          )}
        />
      </View>
    </ScreenContainer>
  );
}
