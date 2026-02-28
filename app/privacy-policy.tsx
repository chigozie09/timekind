import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <ScreenContainer className="p-6">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-3xl font-bold text-foreground">Privacy Policy</Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-2xl text-muted">✕</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          <Section title="Data Collection">
            <Text className="text-base text-muted leading-relaxed">
              TimeKind collects task data, time estimates, and reflections that you create. This data is stored locally on your device and is never sent to external servers without your explicit consent.
            </Text>
          </Section>

          <Section title="Data Storage">
            <Text className="text-base text-muted leading-relaxed">
              All your data is stored locally using device storage (AsyncStorage). We do not collect, store, or access your personal information on our servers.
            </Text>
          </Section>

          <Section title="Permissions">
            <Text className="text-base text-muted leading-relaxed">
              TimeKind may request permissions for:
              {'\n'}• Notifications: To remind you of upcoming tasks
              {'\n'}• Calendar: To export task data to your calendar
              {'\n'}• Audio: To play sound effects and breathing exercises
            </Text>
          </Section>

          <Section title="Third-Party Services">
            <Text className="text-base text-muted leading-relaxed">
              TimeKind does not share your data with third parties. We do not use analytics, advertising, or tracking services.
            </Text>
          </Section>

          <Section title="Changes to This Policy">
            <Text className="text-base text-muted leading-relaxed">
              We may update this privacy policy from time to time. Continued use of TimeKind constitutes acceptance of any changes.
            </Text>
          </Section>

          <Section title="Contact Us">
            <Text className="text-base text-muted leading-relaxed">
              If you have questions about this privacy policy, please contact us through the app's settings.
            </Text>
          </Section>

          <Text className="text-xs text-muted text-center mt-4">
            Last updated: February 2026
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-xl font-semibold text-foreground">{title}</Text>
      {children}
    </View>
  );
}
