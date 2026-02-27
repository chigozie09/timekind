import { useEffect, useRef, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";

import {
  computeAccuracy,
  getTimeOfDayTag,
  Task,
} from "@/lib/store";
import { useKeepAwake } from "expo-keep-awake";

export default function ActiveTimerScreen() {
  useKeepAwake();
  const { tasks, updateTask } = useApp();

  const { taskId } = useLocalSearchParams<{ taskId: string }>();

  const task = tasks.find((t) => t.id === taskId);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentEstimate, setCurrentEstimate] = useState(
    task?.estimatedMinutes ?? 15
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedAtRef = useRef<number>(0);

  useEffect(() => {
    if (!task) return;
    // Calculate initial elapsed from startTime
    const startMs = new Date(task.startTime).getTime();
    const nowMs = Date.now();
    const initialElapsed = Math.floor((nowMs - startMs) / 1000);
    setElapsedSeconds(Math.max(0, initialElapsed));
    setCurrentEstimate(task.estimatedMinutes);
  }, [task?.id]);

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  if (!task) {
    return (
      <ScreenContainer
        edges={["top", "bottom", "left", "right"]}
        className="flex-1 justify-center items-center px-5"
      >
        <Text className="text-foreground text-lg font-medium">Task not found.</Text>
        <TouchableOpacity onPress={() => router.replace("/(tabs)")} className="mt-4">
          <Text className="text-primary text-lg font-semibold">Go Home</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const estimatedSeconds = currentEstimate * 60;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const remainingSeconds = Math.max(0, estimatedSeconds - elapsedSeconds);
  const remainingMinutes = Math.ceil(remainingSeconds / 60);
  const isOverrun = elapsedSeconds > estimatedSeconds;
  const progress = Math.min(1, elapsedSeconds / estimatedSeconds);

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleExtend = async (minutes: number) => {
    const newEstimate = currentEstimate + minutes;
    setCurrentEstimate(newEstimate);
    await updateTask(task.id, { estimatedMinutes: newEstimate });
  };

  const handleFinish = async () => {
    const endTime = new Date();
    const startTime = new Date(task.startTime);
    const actualMinutes = Math.max(
      1,
      Math.round((endTime.getTime() - startTime.getTime()) / 60000)
    );
    const accuracyPercent = computeAccuracy(currentEstimate, actualMinutes);
    const timeOfDayTag = getTimeOfDayTag(startTime);

    const updated = await updateTask(task.id, {
      endTime: endTime.toISOString(),
      actualMinutes,
      accuracyPercent,
      timeOfDayTag,
      estimatedMinutes: currentEstimate,
    });



    router.replace({ pathname: "/complete-task", params: { taskId: task.id } });
  };

  const handlePauseResume = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <ScreenContainer
      edges={["top", "bottom", "left", "right"]}
      className="px-5"
    >
      <View className="flex-1 justify-between py-6">
        {/* Task Info */}
        <View className="items-center">
          <Text className="text-base text-muted mb-2 font-medium">Timing</Text>
          <Text className="text-2xl font-bold text-foreground text-center" numberOfLines={2}>
            {task.taskName}
          </Text>
          {task.category && (
            <Text className="text-base text-muted mt-2 font-medium">
              {task.category} · {task.energyLevel}
            </Text>
          )}
        </View>

        {/* Timer Display */}
        <View className="items-center">
          {/* Progress Bar */}
          <View className="w-full h-3 bg-border rounded-full overflow-hidden mb-6">
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: isOverrun ? "#D97706" : "#6B6B6B",
                },
              ]}
            />
          </View>

          {/* Elapsed Time */}
          <Text className="text-6xl font-bold text-foreground tracking-tight">
            {formatTime(elapsedSeconds)}
          </Text>

          {/* Remaining */}
          {!isOverrun ? (
            <Text className="text-lg text-muted mt-3 font-medium">
              ~{remainingMinutes} min left
            </Text>
          ) : (
            <Text className="text-lg text-muted mt-3 font-medium">
              +{elapsedMinutes - currentEstimate} min over estimate
            </Text>
          )}

          {/* Overrun Banner */}
          {isOverrun && (
            <View className="bg-warning rounded-xl px-4 py-4 mt-4 w-full">
              <Text className="text-base text-foreground text-center font-medium">
                You've passed your estimate. Extend or wrap up.
              </Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View className="gap-3">
          {/* Extend Buttons */}
          <View className="flex-row gap-3 justify-center mb-2">
            <TouchableOpacity
              onPress={() => handleExtend(5)}
              className="bg-surface border border-border px-5 py-4 rounded-xl"
              activeOpacity={0.7}
            >
              <Text className="text-base font-semibold text-foreground">+5 min</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleExtend(10)}
              className="bg-surface border border-border px-5 py-4 rounded-xl"
              activeOpacity={0.7}
            >
              <Text className="text-base font-semibold text-foreground">+10 min</Text>
            </TouchableOpacity>
          </View>

          {/* Pause/Resume */}
          <TouchableOpacity
            onPress={handlePauseResume}
            className="bg-surface border border-border py-5 rounded-2xl items-center"
            activeOpacity={0.8}
          >
            <Text className="text-lg font-bold text-foreground">
              {isPaused ? "Resume" : "Pause"}
            </Text>
          </TouchableOpacity>

          {/* Finish */}
          <TouchableOpacity
            onPress={handleFinish}
            className="bg-primary py-5 rounded-2xl items-center"
            activeOpacity={0.8}
          >
            <Text className="text-lg font-bold text-white">
              Finish
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
});
