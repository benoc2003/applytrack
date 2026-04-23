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

const COLOR_OPTIONS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

export default function EditCategoryScreen() {
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams();

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#2563eb');
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
        setSelectedColor(category.color || '#2563eb');
        setIcon(category.icon || '');
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
          color: selectedColor,
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
          accessibilityHint="Edit the name of the category"
        />

        <Text style={[styles.label, { color: colors.text }]}>Colour</Text>
        <View style={styles.colorRow}>
          {COLOR_OPTIONS.map((color) => {
            const isSelected = selectedColor === color;

            return (
              <Pressable
                key={color}
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  isSelected && [styles.selectedCircle, { borderColor: colors.text }],
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Select colour ${color}`}
                accessibilityHint="Sets the category colour"
              />
            );
          })}
        </View>

        <FormField
          label="Icon"
          placeholder="e.g. 💻"
          value={icon}
          onChangeText={setIcon}
          accessibilityHint="Edit the emoji used for the category"
        />

        <View style={styles.previewRow}>
          <Text style={[styles.previewLabel, { color: colors.subtext }]}>Preview</Text>
          <View style={[styles.previewBadge, { backgroundColor: selectedColor }]}>
            <Text style={styles.previewIcon}>{icon.trim() || '📁'}</Text>
          </View>
          <Text style={[styles.previewText, { color: colors.text }]}>
            {name.trim() || 'Category Name'}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Save changes"
            accessibilityHint="Updates this category"
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
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            accessibilityHint="Returns without saving category changes"
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>

          <Pressable
            style={[styles.deleteButton, { backgroundColor: colors.danger }]}
            onPress={handleDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete category"
            accessibilityHint="Deletes this category"
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  colorCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  selectedCircle: {
    borderWidth: 3,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 18,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewIcon: {
    fontSize: 22,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
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