import { db } from '@/drizzle/db';
import { applications, categories } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

type CategoryItem = {
  id: number;
  name: string;
  color: string | null;
};

export default function InsightsScreen() {
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

      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = day === 0 ? 6 : day - 1;
      startOfWeek.setDate(now.getDate() - diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const weekly = apps.filter(a => new Date(a.dateApplied) >= startOfWeek);
      const monthly = apps.filter(a => new Date(a.dateApplied) >= startOfMonth);

      setWeeklyCount(weekly.length);
      setMonthlyCount(monthly.length);
      setTotalCount(apps.length);

      // category breakdown
      const grouped: Record<number, number> = {};

      apps.forEach(app => {
        if (!grouped[app.categoryId]) {
          grouped[app.categoryId] = 0;
        }
        grouped[app.categoryId]++;
      });

      const chart = Object.keys(grouped).map((key, index) => {
        const category = cats.find(c => c.id === Number(key));

        return {
          name: category?.name || 'Other',
          population: grouped[Number(key)],
          color: category?.color || ['#2563eb','#16a34a','#dc2626','#ca8a04','#9333ea'][index % 5],
          legendFontColor: '#0f172a',
          legendFontSize: 12,
        };
      });

      setChartData(chart);
    } catch (error) {
      console.log('Error loading insights:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Insights</Text>
        <Text style={styles.subheading}>Your application activity</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>This Week</Text>
          <Text style={styles.cardMain}>{weeklyCount}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>This Month</Text>
          <Text style={styles.cardMain}>{monthlyCount}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Applications</Text>
          <Text style={styles.cardMain}>{totalCount}</Text>
        </View>

        <Text style={styles.chartTitle}>Applications by Category</Text>

        {chartData.length > 0 && (
          <PieChart
            data={chartData}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              color: () => '#000',
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="10"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fb',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
  },
  cardMain: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    color: '#0f172a',
  },
});