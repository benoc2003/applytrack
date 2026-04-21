import { db } from '@/drizzle/db';
import { applications, categories } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type ApplicationItem = {
  id: number;
  company: string;
  role: string;
  dateApplied: string;
  priorityScore: number;
  notes: string | null;
  categoryId: number;
  categoryName: string;
  categoryIcon: string | null;
};

type CategoryOption = {
  id: number;
  name: string;
  icon: string | null;
};

export default function HomeScreen() {
  const [items, setItems] = useState<ApplicationItem[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days'>('all');

  useFocusEffect(
    useCallback(() => {
      loadApplications();
      loadCategories();
    }, [])
  );

  const loadApplications = async () => {
    try {
      const data = await db
        .select({
          id: applications.id,
          company: applications.company,
          role: applications.role,
          dateApplied: applications.dateApplied,
          priorityScore: applications.priorityScore,
          notes: applications.notes,
          categoryId: applications.categoryId,
          categoryName: categories.name,
          categoryIcon: categories.icon,
        })
        .from(applications)
        .innerJoin(categories, eq(applications.categoryId, categories.id));

      setItems(data as ApplicationItem[]);
    } catch (error) {
      console.log('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await db
        .select({
          id: categories.id,
          name: categories.name,
          icon: categories.icon,
        })
        .from(categories)
        .where(eq(categories.userId, 1));

      setCategoryOptions(data as CategoryOption[]);
    } catch (error) {
      console.log('Error loading categories:', error);
    }
  };

  const filteredItems = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    const now = new Date();

    return items.filter((item) => {
      const matchesSearch =
        search.length === 0 ||
        item.company.toLowerCase().includes(search) ||
        item.role.toLowerCase().includes(search);

      const matchesCategory =
        selectedCategoryId === null || item.categoryId === selectedCategoryId;

      let matchesDate = true;

      if (dateFilter !== 'all') {
        const appliedDate = new Date(item.dateApplied);
        const diffMs = now.getTime() - appliedDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (dateFilter === '7days') {
          matchesDate = diffDays <= 7;
        }

        if (dateFilter === '30days') {
          matchesDate = diffDays <= 30;
        }
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [items, searchText, selectedCategoryId, dateFilter]);

  const renderItem = ({ item }: { item: ApplicationItem }) => {
    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: '/applications/[id]',
            params: { id: String(item.id) },
          })
        }
      >
        <View style={styles.cardTopRow}>
          <View>
            <Text style={styles.company}>{item.company}</Text>
            <Text style={styles.role}>{item.role}</Text>
          </View>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {item.categoryIcon || '📁'} {item.categoryName}
            </Text>
          </View>
        </View>

        <Text style={styles.meta}>
          Applied: {new Date(item.dateApplied).toLocaleDateString()}
        </Text>
        <Text style={styles.meta}>Priority: {item.priorityScore}/5</Text>
        {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
      </Pressable>
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>ApplyTrack</Text>
      <Text style={styles.subheading}>Your applications</Text>

      <View style={styles.actionRow}>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/applications/add' as Href)}
        >
          <Text style={styles.addButtonText}>Add Application</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push('/targets' as any)}
        >
          <Text style={styles.secondaryButtonText}>View Targets</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push('/insights' as any)}
        >
          <Text style={styles.secondaryButtonText}>View Insights</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by company or role"
        placeholderTextColor="#94a3b8"
        value={searchText}
        onChangeText={setSearchText}
      />

      <Text style={styles.filterLabel}>Category</Text>
      <View style={styles.filterRow}>
        <Pressable
          style={[
            styles.filterButton,
            selectedCategoryId === null && styles.filterButtonSelected,
          ]}
          onPress={() => setSelectedCategoryId(null)}
        >
          <Text style={styles.filterButtonText}>All</Text>
        </Pressable>

        {categoryOptions.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.filterButton,
              selectedCategoryId === category.id && styles.filterButtonSelected,
            ]}
            onPress={() => setSelectedCategoryId(category.id)}
          >
            <Text style={styles.filterButtonText}>
              {category.icon || '📁'} {category.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.filterLabel}>Date Range</Text>
      <View style={styles.filterRow}>
        <Pressable
          style={[
            styles.filterButton,
            dateFilter === 'all' && styles.filterButtonSelected,
          ]}
          onPress={() => setDateFilter('all')}
        >
          <Text style={styles.filterButtonText}>All</Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            dateFilter === '7days' && styles.filterButtonSelected,
          ]}
          onPress={() => setDateFilter('7days')}
        >
          <Text style={styles.filterButtonText}>Last 7 Days</Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            dateFilter === '30days' && styles.filterButtonSelected,
          ]}
          onPress={() => setDateFilter('30days')}
        >
          <Text style={styles.filterButtonText}>Last 30 Days</Text>
        </Pressable>
      </View>

      {filteredItems.length === 0 ? (
        <Text style={styles.stateText}>No applications match your filters.</Text>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  actionRow: {
    gap: 12,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#0f766e',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 14,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  filterButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  filterButtonSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
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
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
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
  },
  categoryBadge: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
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