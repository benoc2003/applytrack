import FormField from '@/components/FormField';
import { db } from '@/drizzle/db';
import { applications, categories } from '@/drizzle/schema';
import { useAppTheme } from '@/utils/use-app-theme';
import { eq } from 'drizzle-orm';
import { router } from 'expo-router';
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

type CategoryItem = {
  id: number;
  userId: number;
  name: string;
  color: string | null;
  icon: string | null;
};

export default function AddApplicationScreen() {
  const { colors } = useAppTheme();

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [dateApplied, setDateApplied] = useState('');
  const [priorityScore, setPriorityScore] = useState('');
  const [notes, setNotes] = useState('');
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await db
        .select()
        .from(categories)
        .where(eq(categories.userId, 1));

      setCategoryItems(data as CategoryItem[]);

      if (data.length > 0) {
        setSelectedCategoryId(data[0].id);
      }
    } catch (error) {
      console.log('Error loading categories:', error);
    }
  };

  const handleSave = async () => {
    if (
      !company.trim() ||
      !role.trim() ||
      !dateApplied.trim() ||
      !priorityScore.trim() ||
      !selectedCategoryId
    ) {
      Alert.alert(
        'Missing fields',
        'Please fill in company, role, date, priority score and category.'
      );
      return;
    }

    try {
      await db.insert(applications).values({
        userId: 1,
        company: company.trim(),
        role: role.trim(),
        dateApplied: dateApplied.trim(),
        priorityScore: Number(priorityScore),
        categoryId: selectedCategoryId,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Success', 'Application added successfully.');
      router.back();
    } catch (error) {
      console.log('Error adding application:', error);
      Alert.alert('Error', 'Something went wrong while saving the application.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.heading, { color: colors.text }]}>Add Application</Text>
        <Text style={[styles.subheading, { color: colors.subtext }]}>
          Create a new job application record
        </Text>

        <FormField
          label="Company"
          placeholder="e.g. Google"
          value={company}
          onChangeText={setCompany}
        />

        <FormField
          label="Role"
          placeholder="e.g. Software Engineer"
          value={role}
          onChangeText={setRole}
        />

        <FormField
          label="Date Applied"
          placeholder="e.g. 2026-04-21"
          value={dateApplied}
          onChangeText={setDateApplied}
        />

        <Text style={[styles.categoryLabel, { color: colors.text }]}>Category</Text>
        <View style={styles.categoryList}>
          {categoryItems.map((category) => {
            const isSelected = selectedCategoryId === category.id;

            return (
              <Pressable
                key={category.id}
                style={[
                  styles.categoryOption,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                  isSelected && {
                    borderColor: colors.primary,
                    backgroundColor: colors.selected,
                  },
                ]}
                onPress={() => setSelectedCategoryId(category.id)}
              >
                <Text style={[styles.categoryOptionText, { color: colors.text }]}>
                  {category.icon || '📁'} {category.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FormField
          label="Priority Score"
          placeholder="1 to 5"
          value={priorityScore}
          onChangeText={setPriorityScore}
          keyboardType="numeric"
        />

        <FormField
          label="Notes"
          placeholder="Optional notes"
          value={notes}
          onChangeText={setNotes}
        />

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Application</Text>
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
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryList: {
    marginBottom: 16,
    gap: 10,
  },
  categoryOption: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  categoryOptionText: {
    fontSize: 15,
    fontWeight: '500',
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
});