import FormField from '@/components/FormField';
import { db } from '@/drizzle/db';
import { targets } from '@/drizzle/schema';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function AddTargetScreen() {
  const [periodType, setPeriodType] = useState<'weekly' | 'monthly'>('weekly');
  const [targetCount, setTargetCount] = useState('');
  const [startDate, setStartDate] = useState('');

  const handleSave = async () => {
    if (!targetCount.trim() || !startDate.trim()) {
      Alert.alert('Missing fields', 'Please fill in target count and start date.');
      return;
    }

    try {
      await db.insert(targets).values({
        userId: 1,
        periodType,
        targetCount: Number(targetCount),
        categoryId: null,
        startDate: startDate.trim(),
      });

      Alert.alert('Success', 'Target added successfully.');
      router.back();
    } catch (error) {
      console.log('Error adding target:', error);
      Alert.alert('Error', 'Could not save the target.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Add Target</Text>
      <Text style={styles.subheading}>Create a weekly or monthly goal</Text>

      <Text style={styles.label}>Target Type</Text>
      <View style={styles.optionRow}>
        <Pressable
          style={[
            styles.optionButton,
            periodType === 'weekly' && styles.optionButtonSelected,
          ]}
          onPress={() => setPeriodType('weekly')}
        >
          <Text style={styles.optionButtonText}>Weekly</Text>
        </Pressable>

        <Pressable
          style={[
            styles.optionButton,
            periodType === 'monthly' && styles.optionButtonSelected,
          ]}
          onPress={() => setPeriodType('monthly')}
        >
          <Text style={styles.optionButtonText}>Monthly</Text>
        </Pressable>
      </View>

      <FormField
        label="Target Count"
        placeholder="e.g. 5"
        value={targetCount}
        onChangeText={setTargetCount}
        keyboardType="numeric"
      />

      <FormField
        label="Start Date"
        placeholder="e.g. 2026-04-21"
        value={startDate}
        onChangeText={setStartDate}
      />

      <View style={styles.buttonRow}>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Target</Text>
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  optionButtonSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#dbeafe',
  },
  optionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
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