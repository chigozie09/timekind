import { useState, useRef } from "react";
import { ScrollView, Text, View, TouchableOpacity, StyleSheet, PanResponder, Animated } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import {
  getTasksInRange,
  avgAccuracy,
  avgAccuracyByField,
  getBestTimeOfDay,
  getMostUnderestimatedCategory,
  getDailyAccuracy,
} from "@/lib/store";

export default function InsightsScreen() {
  const { tasks } = useApp();
  const [range, setRange] = useState<7 | 30>(7);
  const panX = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        panX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const threshold = 50;
        if (gestureState.dx > threshold && range === 30) {
          // Swipe right: go to 7-day
          setRange(7);
        } else if (gestureState.dx < -threshold && range === 7) {
          // Swipe left: go to 30-day
          setRange(30);
        }
        Animated.spring(panX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const rangeTasks = getTasksInRange(tasks, range);
  const avg = avgAccuracy(rangeTasks);
  const byCategory = avgAccuracyByField(rangeTasks, "category", 3);
  const byEnergy = avgAccuracyByField(rangeTasks, "energyLevel", 3);
  const byTimeOfDay = avgAccuracyByField(rangeTasks, "timeOfDayTag", 3);
  const bestTime = getBestTimeOfDay(rangeTasks);
  const worstCat = getMostUnderestimatedCategory(rangeTasks);
  const dailyData = getDailyAccuracy(tasks, range);

  const maxAccuracy = dailyData.length > 0
    ? Math.max(...dailyData.map((d) => d.accuracy))
    : 100;

  return (
    <ScreenContainer className="px-5 pt-2">
      <Animated.ScrollView
        {...panResponder.panHandlers}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        <Text className="text-4xl font-bold text-foreground mt-4 mb-6">
          Insights
        </Text>

        {/* Range Toggle */}
        <View className="flex-row gap-2 mb-5">
          <TouchableOpacity
            onPress={() => setRange(7)}
            className={`flex-1 py-3 rounded-xl items-center border ${
              range === 7 ? "bg-primary border-primary" : "bg-surface border-border"
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-base font-semibold ${
                range === 7 ? "text-white" : "text-foreground"
              }`}
            >
              7 days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setRange(30)}
            className={`flex-1 py-3 rounded-xl items-center border ${
              range === 30 ? "bg-primary border-primary" : "bg-surface border-border"
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-base font-semibold ${
                range === 30 ? "text-white" : "text-foreground"
              }`}
            >
              30 days
            </Text>
          </TouchableOpacity>
        </View>

        {/* Average Accuracy */}
        {avg !== null && (
          <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
            <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
              Average Accuracy
            </Text>
            <Text className="text-4xl font-bold text-foreground">
              {avg}%
            </Text>
          </View>
        )}

        {/* Accuracy Trend Chart */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
            Accuracy Trend
          </Text>
          {dailyData.length === 0 ? (
            <Text className="text-base text-muted py-4 text-center">
              Keep going — patterns appear over a few days.
            </Text>
          ) : (
            <View className="h-32 flex-row items-end gap-1">
              {dailyData.map((d, i) => {
                const height = maxAccuracy > 0 ? (d.accuracy / 200) * 100 : 0;
                return (
                  <View key={i} className="flex-1 items-center">
                    <View
                      style={[styles.bar, { height: `${Math.max(4, height)}%` }]}
                      className="bg-primary rounded-t-sm w-full"
                    />
                    <Text className="text-[9px] text-muted mt-1">
                      {d.date.slice(5)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Patterns by Category */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
            By Category
          </Text>
          {Object.keys(byCategory).length === 0 ? (
            <Text className="text-base text-muted">
              Need at least 3 tasks per category to show patterns.
            </Text>
          ) : (
            <View className="gap-2">
              {Object.entries(byCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, acc]) => (
                  <View key={cat} className="flex-row justify-between items-center">
                    <Text className="text-base font-medium text-foreground">{cat}</Text>
                    <View className="flex-row items-center gap-2">
                      <View className="w-20 h-3 bg-border rounded-full overflow-hidden">
                        <View
                          style={{ width: `${Math.min(100, acc / 2)}%` }}
                          className="h-full bg-primary rounded-full"
                        />
                      </View>
                      <Text className="text-base text-muted w-10 text-right font-semibold">{acc}%</Text>
                    </View>
                  </View>
                ))}
            </View>
          )}
        </View>

        {/* Patterns by Energy */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
            By Energy Level
          </Text>
          {Object.keys(byEnergy).length === 0 ? (
            <Text className="text-base text-muted">
              Need at least 3 tasks per energy level to show patterns.
            </Text>
          ) : (
            <View className="gap-2">
              {Object.entries(byEnergy)
                .sort((a, b) => b[1] - a[1])
                .map(([level, acc]) => (
                  <View key={level} className="flex-row justify-between items-center">
                    <Text className="text-base font-medium text-foreground">{level}</Text>
                    <View className="flex-row items-center gap-2">
                      <View className="w-20 h-3 bg-border rounded-full overflow-hidden">
                        <View
                          style={{ width: `${Math.min(100, acc / 2)}%` }}
                          className="h-full bg-primary rounded-full"
                        />
                      </View>
                      <Text className="text-base text-muted w-10 text-right font-semibold">{acc}%</Text>
                    </View>
                  </View>
                ))}
            </View>
          )}
        </View>

        {/* Patterns by Time of Day */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-4">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
            By Time of Day
          </Text>
          {Object.keys(byTimeOfDay).length === 0 ? (
            <Text className="text-base text-muted">
              Need at least 3 tasks per time slot to show patterns.
            </Text>
          ) : (
            <View className="gap-2">
              {Object.entries(byTimeOfDay)
                .sort((a, b) => b[1] - a[1])
                .map(([tag, acc]) => (
                  <View key={tag} className="flex-row justify-between items-center">
                    <Text className="text-base font-medium text-foreground">{tag}</Text>
                    <View className="flex-row items-center gap-2">
                      <View className="w-20 h-3 bg-border rounded-full overflow-hidden">
                        <View
                          style={{ width: `${Math.min(100, acc / 2)}%` }}
                          className="h-full bg-primary rounded-full"
                        />
                      </View>
                      <Text className="text-base text-muted w-10 text-right font-semibold">{acc}%</Text>
                    </View>
                  </View>
                ))}
            </View>
          )}
        </View>

        {/* Common Expansions */}
        <View className="bg-surface rounded-2xl p-5 border border-border">
          <Text className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">
            Common Expansions
          </Text>
          {worstCat ? (
            <Text className="text-base font-medium text-foreground">
              Often expands: {worstCat}
            </Text>
          ) : (
            <Text className="text-base text-muted">
              Keep going — patterns appear over a few days.
            </Text>
          )}
        </View>
      </Animated.ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 4,
  },
});
