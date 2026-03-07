import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getCurrentLanguage, AVAILABLE_LANGUAGES } from '@/lib/i18n';
import { formatDate, formatTime, getRegionalSettings } from '@/lib/regionalization';
import { useColors } from '@/hooks/use-colors';

interface LanguageOnboardingProps {
  onComplete: () => void;
}

/**
 * Language-specific onboarding screen that shows region-relevant features
 */
export function LanguageOnboarding({ onComplete }: LanguageOnboardingProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const currentLanguage = getCurrentLanguage();
  const settings = getRegionalSettings();
  const [currentStep, setCurrentStep] = useState(0);

  const languageInfo = AVAILABLE_LANGUAGES.find((l) => l.code === currentLanguage);

  // Region-specific onboarding content
  const onboardingSteps = [
    {
      title: t('common.routineBuddy'),
      description:
        currentLanguage === 'en'
          ? 'Welcome to TimeKind! Track your tasks and build better time habits.'
          : currentLanguage === 'es'
            ? '¡Bienvenido a TimeKind! Rastrear tus tareas y construir mejores hábitos de tiempo.'
            : currentLanguage === 'fr'
              ? 'Bienvenue à TimeKind! Suivez vos tâches et créez de meilleures habitudes de temps.'
              : currentLanguage === 'de'
                ? 'Willkommen bei TimeKind! Verfolgen Sie Ihre Aufgaben und bauen Sie bessere Zeitgewohnheiten auf.'
                : 'TimeKindへようこそ!タスクを追跡し、より良い時間習慣を構築します。',
      highlight: 'home',
    },
    {
      title:
        currentLanguage === 'en'
          ? 'Your Time Zone'
          : currentLanguage === 'es'
            ? 'Tu Zona Horaria'
            : currentLanguage === 'fr'
              ? 'Votre Fuseau Horaire'
              : currentLanguage === 'de'
                ? 'Ihre Zeitzone'
                : 'あなたのタイムゾーン',
      description:
        currentLanguage === 'en'
          ? `All dates and times are formatted for your region: ${formatDate(new Date())} at ${formatTime(new Date())}`
          : currentLanguage === 'es'
            ? `Todas las fechas y horas se formatean para tu región: ${formatDate(new Date())} a las ${formatTime(new Date())}`
            : currentLanguage === 'fr'
              ? `Toutes les dates et heures sont formatées pour votre région: ${formatDate(new Date())} à ${formatTime(new Date())}`
              : currentLanguage === 'de'
                ? `Alle Daten und Uhrzeiten werden für Ihre Region formatiert: ${formatDate(new Date())} um ${formatTime(new Date())}`
                : `すべての日付と時刻があなたの地域向けにフォーマットされています: ${formatDate(new Date())} ${formatTime(new Date())}`,
      highlight: 'insights',
    },
    {
      title:
        currentLanguage === 'en'
          ? 'Track & Learn'
          : currentLanguage === 'es'
            ? 'Rastrear y Aprender'
            : currentLanguage === 'fr'
              ? 'Suivre et Apprendre'
              : currentLanguage === 'de'
                ? 'Verfolgen und Lernen'
                : '追跡して学ぶ',
      description:
        currentLanguage === 'en'
          ? 'Start a task, see how long it actually takes, and compare with your estimate. Over time, you\'ll understand your time better.'
          : currentLanguage === 'es'
            ? 'Inicia una tarea, ve cuánto tiempo realmente toma y compara con tu estimación. Con el tiempo, entenderás mejor tu tiempo.'
            : currentLanguage === 'fr'
              ? 'Commencez une tâche, voyez combien de temps cela prend réellement et comparez avec votre estimation. Au fil du temps, vous comprendrez mieux votre temps.'
              : currentLanguage === 'de'
                ? 'Starten Sie eine Aufgabe, sehen Sie, wie lange sie tatsächlich dauert, und vergleichen Sie mit Ihrer Schätzung. Mit der Zeit werden Sie Ihre Zeit besser verstehen.'
                : 'タスクを開始し、実際にかかった時間を確認し、推定と比較します。時間とともに、あなたの時間をより良く理解できるようになります。',
      highlight: 'templates',
    },
    {
      title:
        currentLanguage === 'en'
          ? 'Use Templates'
          : currentLanguage === 'es'
            ? 'Usar Plantillas'
            : currentLanguage === 'fr'
              ? 'Utiliser des Modèles'
              : currentLanguage === 'de'
                ? 'Vorlagen Verwenden'
                : 'テンプレートを使用する',
      description:
        currentLanguage === 'en'
          ? 'Create templates for your recurring tasks. Save time and build consistency in your workflow.'
          : currentLanguage === 'es'
            ? 'Crea plantillas para tus tareas recurrentes. Ahorra tiempo y construye consistencia en tu flujo de trabajo.'
            : currentLanguage === 'fr'
              ? 'Créez des modèles pour vos tâches récurrentes. Gagnez du temps et créez de la cohérence dans votre flux de travail.'
              : currentLanguage === 'de'
                ? 'Erstellen Sie Vorlagen für Ihre wiederkehrenden Aufgaben. Sparen Sie Zeit und schaffen Sie Konsistenz in Ihrem Arbeitsablauf.'
                : '繰り返しタスク用のテンプレートを作成します。時間を節約し、ワークフローの一貫性を構築します。',
      highlight: 'journal',
    },
    {
      title:
        currentLanguage === 'en'
          ? 'Reflect & Improve'
          : currentLanguage === 'es'
            ? 'Reflexionar y Mejorar'
            : currentLanguage === 'fr'
              ? 'Réfléchir et Améliorer'
              : currentLanguage === 'de'
                ? 'Nachdenken und Verbessern'
                : '反省と改善',
      description:
        currentLanguage === 'en'
          ? 'Review your completed tasks in the journal. See patterns in your estimates and learn from them.'
          : currentLanguage === 'es'
            ? 'Revisa tus tareas completadas en el diario. Ve patrones en tus estimaciones y aprende de ellos.'
            : currentLanguage === 'fr'
              ? 'Examinez vos tâches complétées dans le journal. Voyez les modèles de vos estimations et apprenez d\'eux.'
              : currentLanguage === 'de'
                ? 'Überprüfen Sie Ihre abgeschlossenen Aufgaben im Tagebuch. Sehen Sie Muster in Ihren Schätzungen und lernen Sie davon.'
                : 'ジャーナルで完了したタスクを確認します。推定のパターンを確認し、そこから学びます。',
      highlight: 'settings',
    },
  ];

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <View className="flex-1 justify-center">
          {/* Language Badge */}
          <View className="mb-8 items-center">
            <View className="bg-primary rounded-full px-4 py-2">
              <Text className="text-white font-semibold">
                {languageInfo?.nativeName} ({languageInfo?.name})
              </Text>
            </View>
          </View>

          {/* Step Content */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-foreground mb-4">{step.title}</Text>
            <Text className="text-lg text-muted leading-relaxed">{step.description}</Text>
          </View>

          {/* Step Indicator */}
          <View className="flex-row justify-center gap-2 mb-8">
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === currentStep ? 'bg-primary w-8' : 'bg-border w-2'
                }`}
              />
            ))}
          </View>


        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="px-6 pb-8 gap-3">
        {currentStep > 0 && (
          <TouchableOpacity
            onPress={() => setCurrentStep(currentStep - 1)}
            className="bg-surface border border-border rounded-xl py-4 active:opacity-70"
            activeOpacity={0.7}
          >
            <Text className="text-center text-lg font-semibold text-foreground">
              {currentLanguage === 'en'
                ? 'Back'
                : currentLanguage === 'es'
                  ? 'Atrás'
                  : currentLanguage === 'fr'
                    ? 'Retour'
                    : currentLanguage === 'de'
                      ? 'Zurück'
                      : '戻る'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => {
            if (isLastStep) {
              onComplete();
            } else {
              setCurrentStep(currentStep + 1);
            }
          }}
          className="bg-primary rounded-xl py-4 active:opacity-80"
          activeOpacity={0.7}
        >
          <Text className="text-center text-lg font-semibold text-white">
            {isLastStep
              ? currentLanguage === 'en'
                ? 'Get Started'
                : currentLanguage === 'es'
                  ? 'Comenzar'
                  : currentLanguage === 'fr'
                    ? 'Commencer'
                    : currentLanguage === 'de'
                      ? 'Anfangen'
                      : '始める'
              : currentLanguage === 'en'
                ? 'Next'
                : currentLanguage === 'es'
                  ? 'Siguiente'
                  : currentLanguage === 'fr'
                    ? 'Suivant'
                    : currentLanguage === 'de'
                      ? 'Nächste'
                      : '次へ'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
