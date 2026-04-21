import FormField from '@/components/FormField';
import { db } from '@/drizzle/db';
import { categories } from '@/drizzle/schema';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function AddCategoryScreen() {
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [icon, setIcon] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing field', 'Please enter a category name.');
      return;
    }

    try {
      await db.insert(categories).values({
        userId: 1,
        name: name.trim(),
        color: color.trim() || '#2563eb',
        icon: icon.trim() || '📁',
      });

      Alert.alert('Success', 'Category added successfully.');
      router.back();
    } catch (error) {
      console.log('Error adding category:', error);
      Alert.alert('Error', 'Something went wrong while saving the category.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Add Category</Text>
      <Text style={styles.subheading}>Create a category for your applications</Text>

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
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Category</Text>
        </Pressable>

        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
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
  buttonRow: {
    marginTop: 8,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#2563eb',
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
    backgroundColor: '#e2e8f0',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
});