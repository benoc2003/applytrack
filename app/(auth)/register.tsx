import FormField from '@/components/FormField';
import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schema';
import { saveCurrentUser } from '@/utils/auth';
import { eq } from 'drizzle-orm';
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

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Missing fields', 'Please complete all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }

    try {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.username, username.trim()));

      if (existing.length > 0) {
        Alert.alert('Username taken', 'Please choose a different username.');
        return;
      }

      const result = await db.insert(users).values({
        username: username.trim(),
        password: password.trim(),
        createdAt: new Date().toISOString(),
      }).returning({ id: users.id });

      if (result.length > 0) {
        await saveCurrentUser(result[0].id);
        Alert.alert('Success', 'Account created successfully.');
router.replace('/(tabs)' as any);
      }
    } catch (error) {
      console.log('Error registering user:', error);
      Alert.alert('Error', 'Could not create account.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Create Account</Text>
      <Text style={styles.subheading}>Register to use ApplyTrack</Text>

      <FormField
        label="Username"
        placeholder="Choose a username"
        value={username}
        onChangeText={setUsername}
      />

      <FormField
        label="Password"
        placeholder="Enter a password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <FormField
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <View style={styles.buttonRow}>
        <Pressable style={styles.primaryButton} onPress={handleRegister}>
          <Text style={styles.primaryButtonText}>Register</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.secondaryButtonText}>Go to Login</Text>
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
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
});