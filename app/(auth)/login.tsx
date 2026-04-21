import FormField from '@/components/FormField';
import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schema';
import { saveCurrentUser } from '@/utils/auth';
import { and, eq } from 'drizzle-orm';
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

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter username and password.');
      return;
    }

    try {
      const result = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.username, username.trim()),
            eq(users.password, password.trim())
          )
        );

      if (result.length === 0) {
        Alert.alert('Login failed', 'Invalid username or password.');
        return;
      }

      await saveCurrentUser(result[0].id);
      Alert.alert('Success', 'Logged in successfully.');
router.replace('/(tabs)' as any);
    } catch (error) {
      console.log('Error logging in:', error);
      Alert.alert('Error', 'Could not log in.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Login</Text>
      <Text style={styles.subheading}>Sign in to ApplyTrack</Text>

      <FormField
        label="Username"
        placeholder="Enter your username"
        value={username}
        onChangeText={setUsername}
      />

      <FormField
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.buttonRow}>
        <Pressable style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.secondaryButtonText}>Create Account</Text>
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