import FormField from '@/components/FormField';
import { db } from '@/drizzle/db';
import { applications, categories } from '@/drizzle/schema';
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

type CategoryItem = {
  id: number;
  userId: number;
  name: string;
  color: string | null;
  icon: string | null;
};

export default function EditApplicationScreen() {
  const { id } = useLocalSearchParams();

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [dateApplied, setDateApplied] = useState('');
  const [priorityScore, setPriorityScore] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      loadCategories();
      loadApplication();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await db
        .select()
        .from(categories)
        .where(eq(categories.userId, 1));

      setCategoryItems(data as CategoryItem[]);
    } catch (error) {
      console.log('Error loading categories:', error);
    }
  };

  const loadApplication = async () => {
    try {
      const result = await db
        .select()
        .from(applications)
        .where(eq(applications.id, Number(id)));

      if (result.length > 0) {
        const application = result[0];
        setCompany(application.company);
        setRole(application.role);
        setDateApplied(application.dateApplied);
        setPriorityScore(String(application.priorityScore));
        setNotes(application.notes ?? '');
        setSelectedCategoryId(application.categoryId);
      }
    } catch (error) {
      console.log('Error loading application for edit:', error);
      Alert.alert('Error', 'Could not load the application.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
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
      await db
        .update(applications)
        .set({
          company: company.trim(),
          role: role.trim(),
          dateApplied: dateApplied.trim(),
          priorityScore: Number(priorityScore),
          categoryId: selectedCategoryId,
          notes: notes.trim(),
        })
        .where(eq(applications.id, Number(id)));

      Alert.alert('Success', 'Application updated successfully.');
      router.back();
    } catch (error) {
      console.log('Error updating application:', error);
      Alert.alert('Error', 'Could not update the application.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>Edit Application</Text>
        <Text style={styles.stateText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Edit Application</Text>
        <Text style={styles.subheading}>Update an existing application</Text>

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

        <Text style={styles.categoryLabel}>Category</Text>
        <View style={styles.categoryList}>
          {categoryItems.map((category) => {
            const isSelected = selectedCategoryId === category.id;

            return (
              <Pressable
                key={category.id}
                style={[
                  styles.categoryOption,
                  isSelected && styles.categoryOptionSelected,
                ]}
                onPress={() => setSelectedCategoryId(category.id)}
              >
                <Text style={styles.categoryOptionText}>
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
          <Pressable style={styles.saveButton} onPress={handleUpdate}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>

          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 24,
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
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  categoryList: {
    marginBottom: 16,
    gap: 10,
  },
  categoryOption: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  categoryOptionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#dbeafe',
  },
  categoryOptionText: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
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
  stateText: {
    fontSize: 16,
    color: '#475569',
    marginTop: 20,
  },
});