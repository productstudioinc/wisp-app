import { supabase } from '@/supabase/client';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '~/components/ui/background';

export default function SettingsScreen() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/welcome');
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
        </View>
      </SafeAreaView>
    </Background>
  );
}
