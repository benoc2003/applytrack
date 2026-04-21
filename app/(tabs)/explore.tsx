import { db } from '@/drizzle/db';
import { categories } from '@/drizzle/schema';
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
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.icon}>{item.icon || '📁'}</Text>
          <View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.color || 'No colour set'}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>Categories</Text>
        <Text style={styles.stateText}>Loading categories...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Categories</Text>
      <Text style={styles.subheading}>Manage your application categories</Text>

      <Pressable style={styles.addButton} onPress={() => router.push('/categories/add')}>
        <Text style={styles.addButtonText}>Add Category</Text>
      </Pressable>

      {items.length === 0 ? (
        <Text style={styles.stateText}>No categories found yet.</Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 28,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  meta: {
    fontSize: 14,
    color: '#475569',
    marginTop: 2,
  },
  stateText: {
    fontSize: 16,
    color: '#475569',
    marginTop: 20,
  },
});