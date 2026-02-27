import React, { useMemo } from "react";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { router } from "expo-router";
import {
  generateHeatmap,
  getCellColor,
  getHeatmapInsights,
} from "@/lib/productivity-heatmap";

export default function HeatmapScreen() {
  const { tasks } = useApp();

  const heatmapData = useMemo(() => generateHeatmap(tasks), [tasks]);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const timeOfDays = ["Morning", "Afternoon", "Evening", "Late"];

  return (
    <ScreenContainer className="flex-1 px-5 pt-4">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-3xl font-bold text-foreground">
          Productivity Heatmap
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="px-4 py-2 rounded-lg bg-surface"
          activeOpacity={0.7}
        >
          <Text className="text-foreground font-semibold">Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Insight Card */}
        <View className="bg-surface rounded-2xl p-5 border border-border mb-6">
          <Text className="text-sm font-semibold text-muted uppercase tracking-widest mb-2">
            Your Pattern
          </Text>
          <Text className="text-base text-foreground leading-relaxed">
            {getHeatmapInsights(heatmapData)}
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
            <Text className="text-xs text-muted font-semibold mb-1">
              Best Day
            </Text>
            <Text className="text-lg font-bold text-primary">
              {heatmapData.bestDay || "—"}
            </Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
            <Text className="text-xs text-muted font-semibold mb-1">
              Best Time
            </Text>
            <Text className="text-lg font-bold text-primary">
              {heatmapData.bestTimeOfDay || "—"}
            </Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
            <Text className="text-xs text-muted font-semibold mb-1">
              Accuracy
            </Text>
            <Text className="text-lg font-bold text-primary">
              {heatmapData.averageAccuracy}%
            </Text>
          </View>
        </View>

        {/* Heatmap Grid */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-6">
          <Text className="text-sm font-semibold text-foreground mb-4">
            Completions by Day & Time
          </Text>

          {/* Time of day labels */}
          <View className="flex-row gap-2 mb-2">
            <View className="w-16" />
            {timeOfDays.map((time) => (
              <View key={time} className="flex-1">
                <Text className="text-xs text-muted font-semibold text-center">
                  {time.slice(0, 3)}
                </Text>
              </View>
            ))}
          </View>

          {/* Grid rows */}
          {days.map((day) => (
            <View key={day} className="flex-row gap-2 mb-2 items-center">
              <View className="w-16">
                <Text className="text-xs font-semibold text-muted">{day}</Text>
              </View>
              {timeOfDays.map((timeOfDay) => {
                const cell = heatmapData.cells.find(
                  (c) => c.day === day && c.timeOfDay === timeOfDay
                );
                const bgColor = getCellColor(cell?.intensity || 0);

                return (
                  <View
                    key={`${day}-${timeOfDay}`}
                    className="flex-1 aspect-square rounded-lg items-center justify-center"
                    style={{ backgroundColor: bgColor }}
                  >
                    {cell && cell.completedCount > 0 && (
                      <Text className="text-xs font-bold text-foreground">
                        {cell.completedCount}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          {/* Legend */}
          <View className="mt-4 pt-4 border-t border-border">
            <Text className="text-xs text-muted font-semibold mb-2">Legend</Text>
            <View className="flex-row gap-2 items-center">
              <View
                className="w-6 h-6 rounded"
                style={{ backgroundColor: "#f5f5f5" }}
              />
              <Text className="text-xs text-muted">No data</Text>
              <View
                className="w-6 h-6 rounded"
                style={{ backgroundColor: "#c6f6d5" }}
              />
              <Text className="text-xs text-muted">Low</Text>
              <View
                className="w-6 h-6 rounded"
                style={{ backgroundColor: "#38a169" }}
              />
              <Text className="text-xs text-muted">High</Text>
            </View>
          </View>
        </View>

        {/* Detailed View */}
        {heatmapData.cells.some((c) => c.completedCount > 0) && (
          <View className="bg-surface rounded-2xl p-4 border border-border mb-6">
            <Text className="text-sm font-semibold text-foreground mb-4">
              Details
            </Text>
            {heatmapData.cells
              .filter((c) => c.completedCount > 0)
              .sort((a, b) => b.completedCount - a.completedCount)
              .slice(0, 5)
              .map((cell) => (
                <View
                  key={`${cell.day}-${cell.timeOfDay}`}
                  className="flex-row justify-between items-center py-3 border-b border-border last:border-b-0"
                >
                  <View>
                    <Text className="text-sm font-semibold text-foreground">
                      {cell.day} - {cell.timeOfDay}
                    </Text>
                    <Text className="text-xs text-muted mt-1">
                      {cell.completedCount} tasks • {cell.accuracy}% accurate
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-sm font-bold text-primary">
                      {cell.completedCount}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
