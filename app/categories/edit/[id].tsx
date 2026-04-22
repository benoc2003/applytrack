import FormField from '@/components/FormField';
import { db } from '@/drizzle/db';
import { categories } from '@/drizzle/schema';
import { useAppTheme } from '@/utils/use-app-theme';
import { eq } from 'drizzle-orm';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function EditCategoryScreen() {
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams();

  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [icon, setIcon] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCategory();
    }
  }, [id]);

  const loadCategory = async () => {
    try {
      const result = await db
        .select()
        .from(categories)
        .where(eq(categories.id, Number(id)));

      if (result.length > 0) {
        const category = result[0];
        setName(category.name);
        setColor(category.color ?? '');
        setIcon(category.icon ?? '');
      }
    } catch (error) {
      console.log('Error loading category:', error);
      Alert.alert('Error', 'Could not load the category.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing field', 'Please enter a category name.');
      return;
    }

    try {
      await db
        .update(categories)
        .set({
          name: name.trim(),
          color: color.trim() || '#2563eb',
          icon: icon.trim() || '📁',
        })
        .where(eq(categories.id, Number(id)));

      Alert.alert('Success', 'Category updated successfully.');
      router.back();
    } catch (error) {
      console.log('Error updating category:', error);
      Alert.alert('Error', 'Could not update the category.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteCategory,
        },
      ]
    );
  };

  const deleteCategory = async () => {
    try {
      await db.delete(categories).where(eq(categories.id, Number(id)));
      Alert.alert('Deleted', 'Category deleted successfully.');
      router.back();
    } catch (error) {
      console.log('Error deleting category:', error);
      Alert.alert('Error', 'Could not delete the category.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.heading, { color: colors.text }]}>Edit Category</Text>
        <Text style={[styles.stateText, { color: colors.subtext }]}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.heading, { color: colors.text }]}>Edit Category</Text>
        <Text style={[styles.subheading, { color: colors.subtext }]}>
          Update your category details
        </Text>

        <FormField
          label="Category Name"
          placeholder="e.g. Software"
          value={name}
          onChangeText={setName}
        />

        <FormField
          label="Colour"
          placeholder="e.g. #2563eb"
          value={color}
          onChangeText={setColor}
        />

        <FormField
          label="Icon"
          placeholder="e.g. 💻"
          value={icon}
          onChangeText={setIcon}
        />

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>

          <Pressable
            style={[
              styles.cancelButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => router.back()}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>

          <Pressable
            style={[styles.deleteButton, { backgroundColor: colors.danger }]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete Category</Text>
          </Pressable>
        </View>
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
    marginBottom: 20,
  },
  buttonRow: {
    marginTop: 10,
    gap: 12,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
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