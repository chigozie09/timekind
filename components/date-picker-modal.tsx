import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useColors } from "@/hooks/use-colors";

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  initialDate?: Date;
}

export function DatePickerModal({
  visible,
  onClose,
  onSelectDate,
  initialDate,
}: DatePickerModalProps) {
  const colors = useColors();
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  const [selectedMonth, setSelectedMonth] = useState(selectedDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(selectedDate.getFullYear());

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const currentDate = new Date();
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleSelectDate = (day: number) => {
    const newDate = new Date(selectedYear, selectedMonth, day);
    setSelectedDate(newDate);
    onSelectDate(newDate);
    onClose();
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const isToday = (day: number) => {
    return (
      day === currentDate.getDate() &&
      selectedMonth === currentDate.getMonth() &&
      selectedYear === currentDate.getFullYear()
    );
  };

  const isPast = (day: number) => {
    const checkDate = new Date(selectedYear, selectedMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View
          className="bg-surface rounded-2xl p-6 border border-border w-full"
          style={{ maxWidth: 400 }}
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity onPress={handlePrevMonth} className="p-2">
              <Text className="text-2xl text-primary">‹</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">
              {monthNames[selectedMonth]} {selectedYear}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} className="p-2">
              <Text className="text-2xl text-primary">›</Text>
            </TouchableOpacity>
          </View>

          {/* Day Headers */}
          <View className="flex-row gap-1 mb-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <View key={day} className="flex-1 items-center">
                <Text className="text-xs font-semibold text-muted">{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="gap-1 mb-6">
            {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIdx) => (
              <View key={weekIdx} className="flex-row gap-1">
                {days.slice(weekIdx * 7, (weekIdx + 1) * 7).map((day, dayIdx) => (
                  <TouchableOpacity
                    key={dayIdx}
                    onPress={() => day && handleSelectDate(day)}
                    disabled={!day || isPast(day)}
                    className={`flex-1 aspect-square rounded-lg items-center justify-center ${
                      !day
                        ? "bg-transparent"
                        : isPast(day)
                        ? "bg-background opacity-50"
                        : isToday(day)
                        ? "bg-primary"
                        : "bg-background border border-border"
                    }`}
                  >
                    {day && (
                      <Text
                        className={`font-semibold text-base ${
                          isToday(day)
                            ? "text-white"
                            : isPast(day)
                            ? "text-muted"
                            : "text-foreground"
                        }`}
                      >
                        {day}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 py-3 rounded-lg bg-surface border border-border items-center"
            >
              <Text className="text-lg font-semibold text-foreground">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                const today = new Date();
                handleSelectDate(today.getDate());
              }}
              className="flex-1 py-3 rounded-lg bg-surface border border-primary items-center"
            >
              <Text className="text-lg font-semibold text-primary">Today</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
