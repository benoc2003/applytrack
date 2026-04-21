import { db } from '@/drizzle/db';
import { applications } from '@/drizzle/schema';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

type ApplicationItem = {
  id: number;
  company: string;
  role: string;
  dateApplied: string;
  priorityScore: number;
  notes: string | null;
};

export default function HomeScreen() {
  const [items, setItems] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await db.select().from(applications);
      setItems(data as ApplicationItem[]);
    } catch (error) {
      console.log('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ApplicationItem }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.company}>{item.company}</Text>
        <Text style={styles.role}>{item.role}</Text>
        <Text style={styles.meta}>Applied: {new Date(item.dateApplied).toLocaleDateString()}</Text>
        <Text style={styles.meta}>Priority: {item.priorityScore}/5</Text>
        {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>ApplyTrack</Text>
        <Text style={styles.stateText}>Loading applications...</Text>
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>ApplyTrack</Text>
        <Text style={styles.stateText}>No applications found yet.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
<Text style={styles.heading}>ApplyTrack</Text>
<Text style={styles.subheading}>Your applications</Text>

<Pressable style={styles.addButton} onPress={() => router.push('/applications/add')}>
  <Text style={styles.addButtonText}>Add Application</Text>
</Pressable>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
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
  listContent: {
    paddingBottom: 24,
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
  company: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  role: {
    fontSize: 15,
    color: '#1e293b',
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 2,
  },
  notes: {
    fontSize: 14,
    color: '#334155',
    marginTop: 8,
  },
  stateText: {
    fontSize: 16,
    color: '#475569',
    marginTop: 20,
  },
});