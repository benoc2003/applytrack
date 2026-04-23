import { db } from '@/drizzle/db';
import { categories } from '@/drizzle/schema';
import { useAppTheme } from '@/utils/use-app-theme';
import { eq } from 'drizzle-orm';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

type CategoryItem = {
  id: number;
  userId: number;
  name: string;
  color: string | null;
  icon: string | null;
};

export default function CategoriesScreen() {
  const { colors } = useAppTheme();

  const [items, setItems] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  const loadCategories = async () => {
    try {
      const data = await db
        .select()
        .from(categories)
        .where(eq(categories.userId, 1));

      setItems(data as CategoryItem[]);
    } catch (error) {
      console.log('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: CategoryItem }) => {
    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/categories/edit/[id]',
            params: { id: String(item.id) },
          })
        }
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            shadowOpacity: 0.08,
            elevation: 3,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${item.name} category`}
        accessibilityHint={`Opens the edit screen for the ${item.name} category`}
      >
        <View style={styles.row}>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: item.color || colors.badge },
            ]}
          >
            <Text style={styles.icon}>{item.icon || '📁'}</Text>
          </View>

          <View style={styles.textBlock}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.heading, { color: colors.text }]}>Categories</Text>
        <Text style={[styles.stateText, { color: colors.subtext }]}>Loading categories...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>Categories</Text>
      <Text style={[styles.subheading, { color: colors.subtext }]}>
        Manage your application categories
      </Text>

      <Pressable
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/categories/add' as any)}
        accessibilityRole="button"
        accessibilityLabel="Add category"
        accessibilityHint="Opens the form to create a new category"
      >
        <Text style={styles.addButtonText}>Add Category</Text>
      </Pressable>

      {items.length === 0 ? (
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
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No categories found yet</Text>
          <Text style={[styles.emptyText, { color: colors.subtext }]}>
            Add your first category to organise applications by type or industry.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
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
    paddingTop: 32,
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
  listContent: {
    paddingBottom: 32,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  textBlock: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
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