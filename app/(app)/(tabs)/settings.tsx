import { supabase } from '@/supabase/client';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '~/components/ui/background';
import { Button } from '~/components/ui/button';
import { generateAPIUrl } from '~/lib/utils';

export default function SettingsScreen() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/welcome');
  };

  const handleDeleteAccount = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(generateAPIUrl(`/api/delete?userId=${user.id}`));
              await supabase.auth.signOut();
              router.replace('/(auth)/welcome');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ],
    );
  };

  return (
    <Background>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-1 px-6">
          <View className="py-6">
            <Text className="text-4xl font-bold mb-3 text-foreground">Settings</Text>
            <Text className="text-xl text-muted-foreground">Manage your account</Text>
          </View>

          <TouchableOpacity
            className="bg-destructive py-4 px-6 rounded-full mt-8"
            onPress={handleSignOut}>
            <Text className="text-center text-destructive-foreground font-semibold text-xl">
              Sign Out
            </Text>
          </TouchableOpacity>

          <Button
            className="bg-destructive/10 py-4 px-6 rounded-full mt-4"
            onPress={handleDeleteAccount}>
            <Text className="text-center text-destructive font-semibold text-xl">
              Delete Account
            </Text>
          </Button>
        </View>
      </SafeAreaView>
    </Background>
  );
}
