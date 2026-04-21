import { db } from '@/drizzle/db';
import { applications, targets } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type TargetItem = {
  id: number;
  userId: number;
  periodType: string;
  targetCount: number;
  categoryId: number | null;
  startDate: string;
};

export default function TargetsScreen() {
  const [items, setItems] = useState<TargetItem[]>([]);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadTargets();
      loadProgress();
    }, [])
  );

  const loadTargets = async () => {
    try {
      const data = await db
        .select()
        .from(targets)
        .where(eq(targets.userId, 1));

      setItems(data as TargetItem[]);
    } catch (error) {
      console.log('Error loading targets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const data = await db.select().from(applications);

      const now = new Date();

      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = day === 0 ? 6 : day - 1;
      startOfWeek.setDate(now.getDate() - diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const weekly = data.filter((item) => {
        const appliedDate = new Date(item.dateApplied);
        return appliedDate >= startOfWeek;
      });

      const monthly = data.filter((item) => {
        const appliedDate = new Date(item.dateApplied);
        return appliedDate >= startOfMonth;
      });

      setWeeklyCount(weekly.length);
      setMonthlyCount(monthly.length);
    } catch (error) {
      console.log('Error loading target progress:', error);
    }
  };

  const renderProgressCard = (target: TargetItem) => {
    const current = target.periodType === 'weekly' ? weeklyCount : monthlyCount;
    const remaining = Math.max(target.targetCount - current, 0);
    const exceededBy = current > target.targetCount ? current - target.targetCount : 0;
    const met = current >= target.targetCount;

    return (
      <View key={target.id} style={styles.card}>
        <Text style={styles.cardTitle}>
          {target.periodType === 'weekly' ? 'Weekly Target' : 'Monthly Target'}
        </Text>

        <Text style={styles.cardMain}>
          {current} / {target.targetCount}
        </Text>

        {met ? (
          <Text style={styles.successText}>
            {exceededBy > 0 ? `Exceeded by ${exceededBy}` : 'Target met'}
          </Text>
        ) : (
          <Text style={styles.infoText}>{remaining} remaining</Text>
        )}

        <Text style={styles.metaText}>
          Started: {new Date(target.startDate).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Targets</Text>
        <Text style={styles.subheading}>Track weekly and monthly application goals</Text>

        <Pressable style={styles.addButton} onPress={() => router.push('/targets/add')}>
          <Text style={styles.addButtonText}>Add Target</Text>
        </Pressable>

        {loading ? (
          <Text style={styles.stateText}>Loading targets...</Text>
        ) : items.length === 0 ? (
          <Text style={styles.stateText}>No targets created yet.</Text>
        ) : (
          items.map(renderProgressCard)
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
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  cardMain: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 6,
  },
  successText: {
    fontSize: 14,
    color: '#15803d',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#64748b',
  },
  stateText: {
    fontSize: 16,
    color: '#475569',
    marginTop: 20,
  },
});