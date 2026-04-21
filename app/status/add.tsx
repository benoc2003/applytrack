import FormField from '@/components/FormField';
import { db } from '@/drizzle/db';
import { applicationStatusLogs } from '@/drizzle/schema';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function AddStatusScreen() {
  const { applicationId } = useLocalSearchParams();

  const [status, setStatus] = useState('');
  const [statusDate, setStatusDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!status.trim() || !statusDate.trim() || !applicationId) {
      Alert.alert('Missing fields', 'Please fill in status and date.');
      return;
    }

    try {
      await db.insert(applicationStatusLogs).values({
        applicationId: Number(applicationId),
        status: status.trim(),
        statusDate: statusDate.trim(),
        notes: notes.trim(),
      });

      Alert.alert('Success', 'Status update added successfully.');
      router.back();
    } catch (error) {
      console.log('Error adding status update:', error);
      Alert.alert('Error', 'Could not save the status update.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Add Status Update</Text>
      <Text style={styles.subheading}>Track progress for this application</Text>

      <FormField
        label="Status"
        placeholder="e.g. Applied, Interviewing, Rejected"
        value={status}
        onChangeText={setStatus}
      />

      <FormField
        label="Status Date"
        placeholder="e.g. 2026-04-21"
        value={statusDate}
        onChangeText={setStatusDate}
      />

      <FormField
        label="Notes"
        placeholder="Optional notes"
        value={notes}
        onChangeText={setNotes}
      />

      <View style={styles.buttonRow}>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Status</Text>
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