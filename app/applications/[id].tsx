import { db } from '@/drizzle/db';
import { applicationStatusLogs, applications, categories } from '@/drizzle/schema';
import { useAppTheme } from '@/utils/use-app-theme';
import { desc, eq } from 'drizzle-orm';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type ApplicationDetails = {
  id: number;
  company: string;
  role: string;
  dateApplied: string;
  priorityScore: number;
  notes: string | null;
  categoryName: string;
  categoryIcon: string | null;
};

type StatusItem = {
  id: number;
  status: string;
  statusDate: string;
  notes: string | null;
};

export default function ApplicationDetailsScreen() {
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams();

  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [statusItems, setStatusItems] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadApplication();
        loadStatusHistory();
      }
    }, [id])
  );

  const loadApplication = async () => {
    try {
      const result = await db
        .select({
          id: applications.id,
          company: applications.company,
          role: applications.role,
          dateApplied: applications.dateApplied,
          priorityScore: applications.priorityScore,
          notes: applications.notes,
          categoryName: categories.name,
          categoryIcon: categories.icon,
        })
        .from(applications)
        .innerJoin(categories, eq(applications.categoryId, categories.id))
        .where(eq(applications.id, Number(id)));

      if (result.length > 0) {
        setApplication(result[0] as ApplicationDetails);
      }
    } catch (error) {
      console.log('Error loading application:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatusHistory = async () => {
    try {
      const result = await db
        .select({
          id: applicationStatusLogs.id,
          status: applicationStatusLogs.status,
          statusDate: applicationStatusLogs.statusDate,
          notes: applicationStatusLogs.notes,
        })
        .from(applicationStatusLogs)
        .where(eq(applicationStatusLogs.applicationId, Number(id)))
        .orderBy(
          desc(applicationStatusLogs.statusDate),
          desc(applicationStatusLogs.id)
        );

      setStatusItems(result as StatusItem[]);
    } catch (error) {
      console.log('Error loading status history:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Application',
      'Are you sure you want to delete this application?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteApplication,
        },
      ]
    );
  };

  const deleteApplication = async () => {
    try {
      await db.delete(applications).where(eq(applications.id, Number(id)));
      Alert.alert('Deleted', 'Application deleted successfully.');
      router.back();
    } catch (error) {
      console.log('Error deleting application:', error);
      Alert.alert('Error', 'Could not delete the application.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.heading, { color: colors.text }]}>Application Details</Text>
        <Text style={[styles.stateText, { color: colors.subtext }]}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!application) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.heading, { color: colors.text }]}>Application Details</Text>
        <Text style={[styles.stateText, { color: colors.subtext }]}>Application not found.</Text>
      </SafeAreaView>
    );
  }

  const latestStatus = statusItems.length > 0 ? statusItems[0] : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.heading, { color: colors.text }]}>{application.company}</Text>
        <Text style={[styles.subheading, { color: colors.subtext }]}>{application.role}</Text>

        <View style={[styles.categoryBadge, { backgroundColor: colors.badge }]}>
          <Text style={[styles.categoryBadgeText, { color: colors.text }]}>
            {application.categoryIcon || '📁'} {application.categoryName}
          </Text>
        </View>

        <View
          style={[
            styles.latestStatusCard,
            {
              backgroundColor: colors.selected,
              borderColor: colors.primary,
            },
          ]}
        >
          <Text style={[styles.latestStatusLabel, { color: colors.primary }]}>Latest Status</Text>
          <Text style={[styles.latestStatusValue, { color: colors.text }]}>
            {latestStatus ? latestStatus.status : 'No status updates yet'}
          </Text>
          {latestStatus ? (
            <Text style={[styles.latestStatusDate, { color: colors.subtext }]}>
              {new Date(latestStatus.statusDate).toLocaleDateString()}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              shadowOpacity: 0.08,
              elevation: 3,
            },
          ]}
        >
          <Text style={[styles.label, { color: colors.muted }]}>Date Applied</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {new Date(application.dateApplied).toLocaleDateString()}
          </Text>

          <Text style={[styles.label, { color: colors.muted }]}>Priority Score</Text>
          <Text style={[styles.value, { color: colors.text }]}>{application.priorityScore}/5</Text>

          <Text style={[styles.label, { color: colors.muted }]}>Notes</Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {application.notes && application.notes.trim().length > 0
              ? application.notes
              : 'No notes added'}
          </Text>
        </View>

        <Text style={[styles.sectionHeading, { color: colors.text }]}>Status History</Text>

        {statusItems.length === 0 ? (
          <Text style={[styles.stateText, { color: colors.subtext }]}>No status history yet.</Text>
        ) : (
          statusItems.map((item) => (
            <View
              key={item.id}
              style={[
                styles.statusCard,
                {
                  backgroundColor: colors.card,
                  shadowOpacity: 0.06,
                  elevation: 2,
                },
              ]}
            >
              <Text style={[styles.statusTitle, { color: colors.text }]}>{item.status}</Text>
              <Text style={[styles.statusDate, { color: colors.subtext }]}>
                {new Date(item.statusDate).toLocaleDateString()}
              </Text>
              <Text style={[styles.statusNotes, { color: colors.subtext }]}>
                {item.notes && item.notes.trim().length > 0 ? item.notes : 'No notes added'}
              </Text>
            </View>
          ))
        )}

        <Pressable
          style={[styles.addStatusButton, { backgroundColor: colors.secondary }]}
          onPress={() =>
            router.push({
              pathname: '/status/add',
              params: { applicationId: String(application.id) },
            })
          }
        >
          <Text style={styles.addStatusButtonText}>Add Status Update</Text>
        </Pressable>

        <Pressable
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={() =>
            router.push({
              pathname: '/applications/edit/[id]',
              params: { id: String(application.id) },
            })
          }
        >
          <Text style={styles.editButtonText}>Edit Application</Text>
        </Pressable>

        <Pressable
          style={[styles.deleteButton, { backgroundColor: colors.danger }]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Delete Application</Text>
        </Pressable>
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
    fontSize: 17,
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginBottom: 16,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  latestStatusCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
  },
  latestStatusLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  latestStatusValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  latestStatusDate: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionHeading: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 12,
  },
  statusCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusDate: {
    fontSize: 14,
    marginTop: 4,
  },
  statusNotes: {
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    lineHeight: 22,
  },
  addStatusButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  addStatusButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  editButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  stateText: {
    fontSize: 16,
    marginTop: 20,
  },
});