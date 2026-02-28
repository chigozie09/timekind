import React, { useEffect, useState } from 'react';
import { Modal, View } from 'react-native';
import { LanguageOnboarding } from './language-onboarding';
import { useApp } from '@/lib/app-context';

/**
 * Wrapper component that displays the language onboarding modal
 * on first app launch
 */
export function OnboardingModalWrapper() {
  const { settings, updateSettings } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show onboarding if not completed
    if (!settings.hasCompletedOnboarding) {
      setVisible(true);
    }
  }, [settings.hasCompletedOnboarding]);

  const handleComplete = async () => {
    setVisible(false);
    await updateSettings({ hasCompletedOnboarding: true });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      hardwareAccelerated={true}
    >
      <View style={{ flex: 1 }}>
        <LanguageOnboarding onComplete={handleComplete} />
      </View>
    </Modal>
  );
}
