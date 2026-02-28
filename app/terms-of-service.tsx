import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';

export default function TermsOfService() {
  const router = useRouter();

  return (
    <ScreenContainer className="p-6">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-3xl font-bold text-foreground">Terms of Service</Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-2xl text-muted">✕</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          <Section title="Acceptance of Terms">
            <Text className="text-base text-muted leading-relaxed">
              By using TimeKind, you agree to these terms of service. If you do not agree with any part of these terms, you may not use the app.
            </Text>
          </Section>

          <Section title="Use License">
            <Text className="text-base text-muted leading-relaxed">
              TimeKind grants you a limited, non-exclusive license to use this app for personal, non-commercial purposes. You may not modify, copy, distribute, or reverse-engineer the app.
            </Text>
          </Section>

          <Section title="User Responsibilities">
            <Text className="text-base text-muted leading-relaxed">
              You are responsible for maintaining the confidentiality of your device and data. You agree to use TimeKind only for lawful purposes and in a way that does not infringe upon the rights of others.
            </Text>
          </Section>

          <Section title="Disclaimer of Warranties">
            <Text className="text-base text-muted leading-relaxed">
              TimeKind is provided "as is" without warranties of any kind. We do not guarantee that the app will be error-free or uninterrupted.
            </Text>
          </Section>

          <Section title="Limitation of Liability">
            <Text className="text-base text-muted leading-relaxed">
              In no event shall TimeKind be liable for any indirect, incidental, special, or consequential damages arising from your use of the app.
            </Text>
          </Section>

          <Section title="Changes to Terms">
            <Text className="text-base text-muted leading-relaxed">
              We reserve the right to modify these terms at any time. Your continued use of TimeKind constitutes acceptance of any changes.
            </Text>
          </Section>

          <Section title="Governing Law">
            <Text className="text-base text-muted leading-relaxed">
              These terms are governed by applicable law. Any disputes shall be resolved in accordance with local jurisdiction.
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
