import { db } from '@/drizzle/db';
import { applications, categories } from '@/drizzle/schema';
import { useAppTheme } from '@/utils/use-app-theme';
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
  const { colors } = useAppTheme();

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
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            shadowOpacity: 0.08,
            elevation: 3,
          },
        ]}
        onPress={() =>
          router.push({
            pathname: '/applications/[id]',
            params: { id: String(item.id) },
          })
        }
        accessibilityRole="button"
        accessibilityLabel={`${item.company} application`}
        accessibilityHint={`Opens details for the ${item.role} application at ${item.company}`}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.cardTextBlock}>
            <Text style={[styles.company, { color: colors.text }]}>{item.company}</Text>
            <Text style={[styles.role, { color: colors.subtext }]}>{item.role}</Text>
          </View>

          <View style={[styles.categoryBadge, { backgroundColor: colors.badge }]}>
            <Text style={[styles.categoryBadgeText, { color: colors.text }]} numberOfLines={1}>
              {item.categoryIcon || '📁'} {item.categoryName}
            </Text>
          </View>
        </View>

        <Text style={[styles.meta, { color: colors.muted }]}>
          Applied: {new Date(item.dateApplied).toLocaleDateString()}
        </Text>
        <Text style={[styles.meta, { color: colors.muted }]}>
          Priority: {item.priorityScore}/5
        </Text>
        {item.notes ? (
          <Text style={[styles.notes, { color: colors.subtext }]}>{item.notes}</Text>
        ) : null}
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.heading, { color: colors.text }]}>ApplyTrack</Text>
        <Text style={[styles.stateText, { color: colors.subtext }]}>Loading applications...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>ApplyTrack</Text>
      <Text style={[styles.subheading, { color: colors.subtext }]}>Your applications</Text>

      <View style={styles.actionSection}>
        <View style={styles.actionRow}>
          <Pressable
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/applications/add' as Href)}
            accessibilityRole="button"
            accessibilityLabel="Add application"
            accessibilityHint="Opens the form to create a new job application"
          >
            <Text style={styles.addButtonText}>Add Application</Text>
          </Pressable>

          <Pressable
            style={[styles.secondaryButton, { backgroundColor: colors.secondary }]}
            onPress={() => router.push('/targets' as any)}
            accessibilityRole="button"
            accessibilityLabel="View targets"
            accessibilityHint="Opens your weekly and monthly application targets"
          >
            <Text style={styles.secondaryButtonText}>View Targets</Text>
          </Pressable>

          <Pressable
            style={[styles.secondaryButton, { backgroundColor: colors.secondary }]}
            onPress={() => router.push('/insights' as any)}
            accessibilityRole="button"
            accessibilityLabel="View insights"
            accessibilityHint="Opens charts and analytics for your applications"
          >
            <Text style={styles.secondaryButtonText}>View Insights</Text>
          </Pressable>
        </View>
      </View>

      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        placeholder="Search by company or role"
        placeholderTextColor={colors.muted}
        value={searchText}
        onChangeText={setSearchText}
        accessibilityLabel="Search applications"
        accessibilityHint="Filter applications by company name or role title"
      />

      <Text style={[styles.filterLabel, { color: colors.text }]}>Category</Text>
      <View style={styles.filterRow}>
        <Pressable
          style={[
            styles.filterButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            selectedCategoryId === null && {
              backgroundColor: colors.selected,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => setSelectedCategoryId(null)}
          accessibilityRole="button"
          accessibilityLabel="Filter by all categories"
          accessibilityHint="Shows applications from every category"
        >
          <Text style={[styles.filterButtonText, { color: colors.text }]}>All</Text>
        </Pressable>

        {categoryOptions.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.filterButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
              selectedCategoryId === category.id && {
                backgroundColor: colors.selected,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setSelectedCategoryId(category.id)}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${category.name}`}
            accessibilityHint={`Shows only applications in the ${category.name} category`}
          >
            <Text style={[styles.filterButtonText, { color: colors.text }]}>
              {category.icon || '📁'} {category.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.filterLabel, { color: colors.text }]}>Date Range</Text>
      <View style={styles.filterRow}>
        <Pressable
          style={[
            styles.filterButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            dateFilter === 'all' && {
              backgroundColor: colors.selected,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => setDateFilter('all')}
          accessibilityRole="button"
          accessibilityLabel="Show all dates"
          accessibilityHint="Displays applications from any date"
        >
          <Text style={[styles.filterButtonText, { color: colors.text }]}>All</Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            dateFilter === '7days' && {
              backgroundColor: colors.selected,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => setDateFilter('7days')}
          accessibilityRole="button"
          accessibilityLabel="Show last 7 days"
          accessibilityHint="Displays applications from the last 7 days"
        >
          <Text style={[styles.filterButtonText, { color: colors.text }]}>Last 7 Days</Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            dateFilter === '30days' && {
              backgroundColor: colors.selected,
              borderColor: colors.primary,
            },
          ]}
          onPress={() => setDateFilter('30days')}
          accessibilityRole="button"
          accessibilityLabel="Show last 30 days"
          accessibilityHint="Displays applications from the last 30 days"
        >
          <Text style={[styles.filterButtonText, { color: colors.text }]}>Last 30 Days</Text>
        </Pressable>
      </View>

      {filteredItems.length === 0 ? (
        <Text style={[styles.stateText, { color: colors.subtext }]}>
          No applications match your filters.
        </Text>
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
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 16,
    marginBottom: 16,
  },
  actionSection: {
    marginBottom: 16,
  },
  actionRow: {
    gap: 12,
  },
  addButton: {
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
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginVertical: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  filterButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTextBlock: {
    flex: 1,
    paddingRight: 8,
  },
  company: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    flexShrink: 1,
  },
  role: {
    fontSize: 15,
    flexShrink: 1,
  },
  categoryBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    maxWidth: 120,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  meta: {
    fontSize: 14,
    marginBottom: 2,
  },
  notes: {
    fontSize: 14,
    marginTop: 8,
  },
  stateText: {
    fontSize: 16,
    marginTop: 20,
  },
});