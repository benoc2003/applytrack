import { db } from '@/drizzle/db';
import { users } from '@/drizzle/schema';
import { clearCurrentUser, getCurrentUser } from '@/utils/auth';
import { eq } from 'drizzle-orm';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const userId = await getCurrentUser();
    setCurrentUserId(userId);
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.subheading}>Manage your account</Text>

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