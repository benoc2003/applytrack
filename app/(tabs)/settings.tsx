import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schema';
import { clearCurrentUser, getCurrentUser } from '@/utils/auth';
import { getThemePreference, saveThemePreference, ThemePreference } from '@/utils/theme';
import { eq } from 'drizzle-orm';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function SettingsScreen() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('light');

  const isDark = themePreference === 'dark';

  useFocusEffect(
    useCallback(() => {
      loadCurrentUser();
      loadTheme();
    }, [])
  );

  const loadCurrentUser = async () => {
    const userId = await getCurrentUser();
    setCurrentUserId(userId);
  };

  const loadTheme = async () => {
    const savedTheme = await getThemePreference();
    setThemePreferenceState(savedTheme ?? 'light');
  };

const handleThemeChange = async (theme: ThemePreference) => {
  await saveThemePreference(theme);
  setThemePreferenceState(theme);
};

  const handleLogout = async () => {
    await clearCurrentUser();
    router.replace('/(auth)/login');
  };

  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete your profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteProfile,
        },
      ]
    );
  };

  const deleteProfile = async () => {
    if (!currentUserId) return;

    try {
      await db.delete(users).where(eq(users.id, currentUserId));
      await clearCurrentUser();
      Alert.alert('Deleted', 'Profile deleted successfully.');
      router.replace('/(auth)/login');
    } catch (error) {
      console.log('Error deleting profile:', error);
      Alert.alert('Error', 'Could not delete profile.');
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#0f172a' : '#f4f7fb' },
      ]}
    >
      <Text style={[styles.heading, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
        Settings
      </Text>
      <Text style={[styles.subheading, { color: isDark ? '#cbd5e1' : '#475569' }]}>
        Manage your account and theme
      </Text>

      <Text style={[styles.sectionLabel, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
        Theme
      </Text>

      <View style={styles.optionRow}>
        <Pressable
          style={[
            styles.optionButton,
            { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#475569' : '#cbd5e1' },
            themePreference === 'light' && styles.optionButtonSelected,
          ]}
          onPress={() => handleThemeChange('light')}
        >
          <Text style={[styles.optionButtonText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
            Light
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.optionButton,
            { backgroundColor: isDark ? '#1e293b' : '#ffffff', borderColor: isDark ? '#475569' : '#cbd5e1' },
            themePreference === 'dark' && styles.optionButtonSelected,
          ]}
          onPress={() => handleThemeChange('dark')}
        >
          <Text style={[styles.optionButtonText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
            Dark
          </Text>
        </Pressable>
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={styles.primaryButton} onPress={handleLogout}>
          <Text style={styles.primaryButtonText}>Logout</Text>
        </Pressable>

        <Pressable style={styles.deleteButton} onPress={handleDeleteProfile}>
          <Text style={styles.deleteButtonText}>Delete Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 16,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    flex: 1,
    borderWidth: 1,
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
  },
  buttonRow: {
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
  deleteButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});