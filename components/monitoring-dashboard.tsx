import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColors } from '@/hooks/use-colors';
import { ScreenContainer } from './screen-container';

interface MetricCard {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color: string;
}

interface MonitoringData {
  appVersion: string;
  buildDate: string;
  platform: 'ios' | 'android' | 'web';
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  activeUsers: number;
  sessionCount: number;
  avgSessionDuration: number;
  crashRate: number;
  errorRate: number;
  performanceScore: number;
  lastUpdated: string;
}

/**
 * Post-Launch Monitoring Dashboard
 * Displays key metrics for app performance and user engagement
 */
export function MonitoringDashboard() {
  const { t } = useTranslation();
  const colors = useColors();
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load monitoring data from analytics
    loadMonitoringData();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadMonitoringData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadMonitoringData = async () => {
    try {
      // In production, this would fetch from your analytics backend
      // For now, we'll use mock data
      const mockData: MonitoringData = {
        appVersion: '1.0.0',
        buildDate: new Date().toISOString().split('T')[0],
        platform: 'ios',
        analyticsEnabled: true,
        crashReportingEnabled: true,
        activeUsers: 1250,
        sessionCount: 4850,
        avgSessionDuration: 8.5,
        crashRate: 0.02,
        errorRate: 0.15,
        performanceScore: 94,
        lastUpdated: new Date().toISOString(),
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text className="text-lg text-muted">Loading monitoring data...</Text>
      </ScreenContainer>
    );
  }

  const metrics: MetricCard[] = [
    {
      title: 'Active Users',
      value: data.activeUsers.toLocaleString(),
      trend: 'up',
      trendValue: '+12%',
      color: 'primary',
    },
    {
      title: 'Sessions',
      value: data.sessionCount.toLocaleString(),
      trend: 'up',
      trendValue: '+8%',
      color: 'success',
    },
    {
      title: 'Avg Session',
      value: data.avgSessionDuration,
      unit: 'min',
      trend: 'up',
      trendValue: '+2.1%',
      color: 'primary',
    },
    {
      title: 'Crash Rate',
      value: (data.crashRate * 100).toFixed(2),
      unit: '%',
      trend: 'down',
      trendValue: '-0.5%',
      color: 'error',
    },
    {
      title: 'Error Rate',
      value: (data.errorRate * 100).toFixed(2),
      unit: '%',
      trend: 'stable',
      color: 'warning',
    },
    {
      title: 'Performance',
      value: data.performanceScore,
      unit: '/100',
      trend: 'up',
      trendValue: '+3',
      color: 'success',
    },
  ];

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Performance Dashboard
          </Text>
          <Text className="text-sm text-muted">
            Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
          </Text>
        </View>

        {/* Build Info */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-6">
          <View className="flex-row justify-between mb-3">
            <View>
              <Text className="text-xs text-muted mb-1">App Version</Text>
              <Text className="text-lg font-semibold text-foreground">{data.appVersion}</Text>
            </View>
            <View>
              <Text className="text-xs text-muted mb-1">Build Date</Text>
              <Text className="text-lg font-semibold text-foreground">{data.buildDate}</Text>
            </View>
            <View>
              <Text className="text-xs text-muted mb-1">Platform</Text>
              <Text className="text-lg font-semibold text-foreground capitalize">
                {data.platform}
              </Text>
            </View>
          </View>
        </View>

        {/* Metrics Grid */}
        <View className="gap-4 mb-6">
          {metrics.map((metric, index) => (
            <View key={index} className="bg-surface rounded-2xl p-4 border border-border">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-sm text-muted flex-1">{metric.title}</Text>
                {metric.trend && (
                  <View
                    className={`px-2 py-1 rounded-lg ${
                      metric.trend === 'up'
                        ? 'bg-success/10'
                        : metric.trend === 'down'
                          ? 'bg-error/10'
                          : 'bg-muted/10'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        metric.trend === 'up'
                          ? 'text-success'
                          : metric.trend === 'down'
                            ? 'text-error'
                            : 'text-muted'
                      }`}
                    >
                      {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}{' '}
                      {metric.trendValue}
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-2xl font-bold text-foreground">{metric.value}</Text>
                {metric.unit && <Text className="text-sm text-muted">{metric.unit}</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* Features Status */}
        <View className="bg-surface rounded-2xl p-4 border border-border mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">Features Status</Text>
          <View className="gap-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-muted">Analytics Tracking</Text>
              <View
                className={`w-3 h-3 rounded-full ${
                  data.analyticsEnabled ? 'bg-success' : 'bg-error'
                }`}
              />
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-muted">Crash Reporting</Text>
              <View
                className={`w-3 h-3 rounded-full ${
                  data.crashReportingEnabled ? 'bg-success' : 'bg-error'
                }`}
              />
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="gap-3 mb-6">
          <TouchableOpacity
            className="bg-primary rounded-xl py-3 active:opacity-80"
            activeOpacity={0.7}
          >
            <Text className="text-center text-base font-semibold text-white">
              View Detailed Analytics
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-surface border border-border rounded-xl py-3 active:opacity-70"
            activeOpacity={0.7}
          >
            <Text className="text-center text-base font-semibold text-foreground">
              Export Report
            </Text>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View className="bg-surface rounded-2xl p-4 border border-border">
          <Text className="text-sm font-semibold text-foreground mb-2">Key Metrics</Text>
          <Text className="text-xs text-muted leading-relaxed">
            <Text className="font-semibold">Active Users:</Text> Unique users in the last 24 hours
            {'\n'}
            <Text className="font-semibold">Sessions:</Text> Total app sessions
            {'\n'}
            <Text className="font-semibold">Crash Rate:</Text> Percentage of sessions with crashes
            {'\n'}
            <Text className="font-semibold">Performance:</Text> Overall app health score (0-100)
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
