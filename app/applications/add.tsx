import FormField from '@/components/FormField';
import { db } from '@/drizzle/db';
import { applications } from '@/drizzle/schema';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function AddApplicationScreen() {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [dateApplied, setDateApplied] = useState('');
  const [priorityScore, setPriorityScore] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!company.trim() || !role.trim() || !dateApplied.trim() || !priorityScore.trim()) {
      Alert.alert('Missing fields', 'Please fill in company, role, date and priority score.');
      return;
    }

    try {
      await db.insert(applications).values({
        userId: 1,
        company: company.trim(),
        role: role.trim(),
        dateApplied: dateApplied.trim(),
        priorityScore: Number(priorityScore),
        categoryId: 1,
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Add Application</Text>
      <Text style={styles.subheading}>Create a new job application record</Text>

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
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Application</Text>
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