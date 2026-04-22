import { db } from '@/drizzle/db';
import { applications, targets } from '@/drizzle/schema';
import { useAppTheme } from '@/utils/use-app-theme';
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
  const { colors } = useAppTheme();

  const [items, setItems] = useState<TargetItem[]>([]);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [weeklyStreak, setWeeklyStreak] = useState(0);
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

  const getStartOfWeek = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const loadProgress = async () => {
    try {
      const data = await db.select().from(applications);
      const targetData = await db
        .select()
        .from(targets)
        .where(eq(targets.userId, 1));

      const now = new Date();

      const startOfWeek = getStartOfWeek(now);
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

      const weeklyTarget = targetData.find((target) => target.periodType === 'weekly');

      if (!weeklyTarget) {
        setWeeklyStreak(0);
        return;
      }

      const applicationsByWeek: Record<string, number> = {};

      data.forEach((item) => {
        const appliedDate = new Date(item.dateApplied);
        const weekStart = getStartOfWeek(appliedDate).toISOString().split('T')[0];

        if (!applicationsByWeek[weekStart]) {
          applicationsByWeek[weekStart] = 0;
        }

        applicationsByWeek[weekStart] += 1;
      });

      let streak = 0;
      let currentWeekStart = getStartOfWeek(now);

      while (true) {
        const weekKey = currentWeekStart.toISOString().split('T')[0];
        const countForWeek = applicationsByWeek[weekKey] || 0;

        if (countForWeek >= weeklyTarget.targetCount) {
          streak += 1;
          currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        } else {
          break;
        }
      }

      setWeeklyStreak(streak);
    } catch (error) {
      console.log('Error loading target progress:', error);
    }
  };

  const renderProgressCard = (target: TargetItem) => {
    const current = target.periodType === 'weekly' ? weeklyCount : monthlyCount;
    const remaining = Math.max(target.targetCount - current, 0);
    const exceededBy = current > target.targetCount ? current - target.targetCount : 0;
    const met = current >= target.targetCount;
    const progressRatio = Math.min(current / target.targetCount, 1);

    return (
      <View
        key={target.id}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            shadowOpacity: 0.08,
            elevation: 3,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {target.periodType === 'weekly' ? 'Weekly Target' : 'Monthly Target'}
        </Text>

        <Text style={[styles.cardMain, { color: colors.primary }]}>
          {current} / {target.targetCount}
        </Text>

        <View style={[styles.progressTrack, { backgroundColor: colors.badge }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressRatio * 100}%`,
                backgroundColor: met ? '#16a34a' : colors.primary,
              },
            ]}
          />
        </View>

        {target.periodType === 'weekly' ? (
          <Text style={[styles.streakText, { color: colors.text }]}>
            Current streak: {weeklyStreak} week{weeklyStreak === 1 ? '' : 's'}
          </Text>
        ) : null}

        {met ? (
          <Text style={styles.successText}>
            {exceededBy > 0 ? `Exceeded by ${exceededBy}` : 'Target met'}
          </Text>
        ) : (
          <Text style={[styles.infoText, { color: colors.subtext }]}>
            {remaining} remaining
          </Text>
        )}

        <Text style={[styles.metaText, { color: colors.muted }]}>
          Started: {new Date(target.startDate).toLocaleDateString()}
        </Text>
        <Pressable
  style={{
    marginTop: 10,
    backgroundColor: colors.danger,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  }}
  onPress={async () => {
    await db.delete(targets).where(eq(targets.id, target.id));
    loadTargets();
    loadProgress();
  }}
>
  <Text style={{ color: '#fff', fontWeight: '600' }}>Delete Target</Text>
</Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.heading, { color: colors.text }]}>Targets</Text>
        <Text style={[styles.subheading, { color: colors.subtext }]}>
          Track weekly and monthly application goals
        </Text>

        <Pressable
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/targets/add' as any)}
        >
          <Text style={styles.addButtonText}>Add Target</Text>
        </Pressable>

        {loading ? (
          <Text style={[styles.stateText, { color: colors.subtext }]}>Loading targets...</Text>
        ) : items.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.card,
                shadowOpacity: 0.08,
                elevation: 3,
              },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No targets created yet</Text>
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              Add a weekly or monthly target to start tracking progress.
            </Text>
          </View>
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
    marginBottom: 16,
  },
  addButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 18,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardMain: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  successText: {
    fontSize: 14,
    color: '#16a34a',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
  },
  emptyCard: {
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  stateText: {
    fontSize: 16,
    marginTop: 20,
  },
});