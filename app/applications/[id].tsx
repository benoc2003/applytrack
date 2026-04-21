import { db } from '@/drizzle/db';
import { applications } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

type ApplicationDetails = {
  id: number;
  company: string;
  role: string;
  dateApplied: string;
  priorityScore: number;
  notes: string | null;
};

export default function ApplicationDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadApplication();
    }
  }, [id]);

  const loadApplication = async () => {
    try {
      const result = await db
        .select()
        .from(applications)
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>{application.company}</Text>
      <Text style={styles.subheading}>{application.role}</Text>

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
    marginBottom: 20,
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