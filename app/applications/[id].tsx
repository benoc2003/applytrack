import { db } from '@/drizzle/db';
import { applicationStatusLogs, applications, categories } from '@/drizzle/schema';
import { desc, eq } from 'drizzle-orm';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

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
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>Application Details</Text>
        <Text style={styles.stateText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!application) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>Application Details</Text>
        <Text style={styles.stateText}>Application not found.</Text>
      </SafeAreaView>
    );
  }

  const latestStatus = statusItems.length > 0 ? statusItems[0] : null;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>{application.company}</Text>
      <Text style={styles.subheading}>{application.role}</Text>

      <View style={styles.categoryBadge}>
        <Text style={styles.categoryBadgeText}>
          {application.categoryIcon || '📁'} {application.categoryName}
        </Text>
      </View>

      {latestStatus ? (
        <View style={styles.latestStatusCard}>
          <Text style={styles.latestStatusLabel}>Latest Status</Text>
          <Text style={styles.latestStatusValue}>{latestStatus.status}</Text>
          <Text style={styles.latestStatusDate}>
            {new Date(latestStatus.statusDate).toLocaleDateString()}
          </Text>
        </View>
      ) : (
        <View style={styles.latestStatusCard}>
          <Text style={styles.latestStatusLabel}>Latest Status</Text>
          <Text style={styles.latestStatusValue}>No status updates yet</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Date Applied</Text>
        <Text style={styles.value}>
          {new Date(application.dateApplied).toLocaleDateString()}
        </Text>

        <Text style={styles.label}>Priority Score</Text>
        <Text style={styles.value}>{application.priorityScore}/5</Text>

        <Text style={styles.label}>Notes</Text>
        <Text style={styles.value}>
          {application.notes && application.notes.trim().length > 0
            ? application.notes
            : 'No notes added'}
        </Text>
      </View>

      <Text style={styles.sectionHeading}>Status History</Text>

      {statusItems.length === 0 ? (
        <Text style={styles.stateText}>No status history yet.</Text>
      ) : (
        statusItems.map((item) => (
          <View key={item.id} style={styles.statusCard}>
            <Text style={styles.statusTitle}>{item.status}</Text>
            <Text style={styles.statusDate}>
              {new Date(item.statusDate).toLocaleDateString()}
            </Text>
            <Text style={styles.statusNotes}>
              {item.notes && item.notes.trim().length > 0 ? item.notes : 'No notes added'}
            </Text>
          </View>
        ))
      )}

      <Pressable
        style={styles.addStatusButton}
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
        style={styles.editButton}
        onPress={() =>
          router.push({
            pathname: '/applications/edit/[id]',
            params: { id: String(application.id) },
          })
        }
      >
        <Text style={styles.editButtonText}>Edit Application</Text>
      </Pressable>

      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Delete Application</Text>
      </Pressable>
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
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e8f0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    marginBottom: 16,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  latestStatusCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  latestStatusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1d4ed8',
    marginBottom: 4,
  },
  latestStatusValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  latestStatusDate: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusDate: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },
  statusNotes: {
    fontSize: 14,
    color: '#334155',
    marginTop: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#0f172a',
  },
  addStatusButton: {
    backgroundColor: '#0f766e',
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
    backgroundColor: '#2563eb',
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
    backgroundColor: '#dc2626',
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
    color: '#475569',
    marginTop: 20,
  },
});