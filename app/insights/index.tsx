import { db } from '@/drizzle/db';
import { applications, categories } from '@/drizzle/schema';
import { useAppTheme } from '@/utils/use-app-theme';
import { eq } from 'drizzle-orm';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function InsightsScreen() {
  const { colors, mode } = useAppTheme();

  const [dailyCount, setDailyCount] = useState(0);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadInsights();
    }, [])
  );

  const loadInsights = async () => {
    try {
      const apps = await db.select().from(applications);
      const cats = await db.select().from(categories).where(eq(categories.userId, 1));

      const now = new Date();

      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = day === 0 ? 6 : day - 1;
      startOfWeek.setDate(now.getDate() - diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const daily = apps.filter((a) => new Date(a.dateApplied) >= startOfToday);
      const weekly = apps.filter((a) => new Date(a.dateApplied) >= startOfWeek);
      const monthly = apps.filter((a) => new Date(a.dateApplied) >= startOfMonth);

      setDailyCount(daily.length);
      setWeeklyCount(weekly.length);
      setMonthlyCount(monthly.length);
      setTotalCount(apps.length);

      const grouped: Record<number, number> = {};

      apps.forEach((app) => {
        if (!grouped[app.categoryId]) {
          grouped[app.categoryId] = 0;
        }
        grouped[app.categoryId]++;
      });

      const fallbackColors = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#9333ea'];

      const chart = Object.keys(grouped).map((key, index) => {
        const category = cats.find((c) => c.id === Number(key));

        return {
          name: category?.name || 'Other',
          population: grouped[Number(key)],
          color: category?.color || fallbackColors[index % fallbackColors.length],
          legendFontColor: mode === 'dark' ? '#f8fafc' : '#0f172a',
          legendFontSize: 12,
        };
      });

      setChartData(chart);
    } catch (error) {
      console.log('Error loading insights:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.heading, { color: colors.text }]}>Insights</Text>
        <Text style={[styles.subheading, { color: colors.subtext }]}>
          Your application activity
        </Text>

        <View style={styles.metricsGrid}>
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: colors.card,
                shadowOpacity: 0.08,
                elevation: 3,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.muted }]}>Today</Text>
            <Text style={[styles.cardMain, { color: colors.primary }]}>{dailyCount}</Text>
          </View>

          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: colors.card,
                shadowOpacity: 0.08,
                elevation: 3,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.muted }]}>This Week</Text>
            <Text style={[styles.cardMain, { color: colors.primary }]}>{weeklyCount}</Text>
          </View>

          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: colors.card,
                shadowOpacity: 0.08,
                elevation: 3,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.muted }]}>This Month</Text>
            <Text style={[styles.cardMain, { color: colors.primary }]}>{monthlyCount}</Text>
          </View>

          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: colors.card,
                shadowOpacity: 0.08,
                elevation: 3,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.muted }]}>Total Applications</Text>
            <Text style={[styles.cardMain, { color: colors.primary }]}>{totalCount}</Text>
          </View>
        </View>

        <View
          style={[
            styles.chartCard,
            {
              backgroundColor: colors.card,
              shadowOpacity: 0.08,
              elevation: 3,
            },
          ]}
        >
          <Text style={[styles.chartTitle, { color: colors.text }]}>Applications by Category</Text>

          {chartData.length > 0 ? (
            <PieChart
              data={chartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                color: () => colors.text,
                labelColor: () => colors.text,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
              absolute
            />
          ) : (
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              No chart data available yet.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 16,
    marginBottom: 20,
  },
  metricsGrid: {
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  cardMain: {
    fontSize: 28,
    fontWeight: '700',
  },
  chartCard: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    marginTop: 8,
  },
});