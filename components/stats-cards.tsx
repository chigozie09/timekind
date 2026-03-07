import { View, Text } from 'react-native';
import { getWeeklyTaskCount, getAverageAccuracy, getMostCommonCategory } from '@/lib/stats-calculator';
import { Task } from '@/lib/store';
import { useColors } from '@/hooks/use-colors';

interface StatsCardsProps {
  tasks: Task[];
}

export function StatsCards({ tasks }: StatsCardsProps) {
  const colors = useColors();
  const weeklyCount = getWeeklyTaskCount(tasks);
  const avgAccuracy = getAverageAccuracy(tasks);
  const topCategory = getMostCommonCategory(tasks);

  return (
    <View className="gap-3 mb-6">
      {/* Weekly Tasks Card */}
      <View className="bg-surface rounded-xl p-4 border border-border">
        <Text className="text-xs text-muted uppercase font-semibold mb-2">This Week</Text>
        <View className="flex-row items-baseline gap-2">
          <Text className="text-3xl font-bold text-primary">{weeklyCount}</Text>
          <Text className="text-sm text-muted">tasks completed</Text>
        </View>
      </View>

      {/* Average Accuracy Card */}
      <View className="bg-surface rounded-xl p-4 border border-border">
        <Text className="text-xs text-muted uppercase font-semibold mb-2">Avg Accuracy</Text>
        <View className="flex-row items-baseline gap-2">
          <Text className="text-3xl font-bold text-foreground">{avgAccuracy}%</Text>
          <Text className="text-sm text-muted">time insight</Text>
        </View>
      </View>

      {/* Top Category Card */}
      <View className="bg-surface rounded-xl p-4 border border-border">
        <Text className="text-xs text-muted uppercase font-semibold mb-2">Top Category</Text>
        <View className="flex-row items-baseline gap-2">
          <Text className="text-2xl font-bold text-foreground">{topCategory}</Text>
        </View>
      </View>
    </View>
  );
}
