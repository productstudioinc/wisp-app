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
        <View className="flex-1 px-6 py-12">
          <Text className="text-4xl font-bold mb-2 text-foreground">Settings</Text>
          <Text className="text-lg text-muted-foreground mb-8">Manage your account</Text>

          <TouchableOpacity className="bg-destructive py-4 rounded-full" onPress={handleSignOut}>
            <Text className="text-center text-destructive-foreground font-semibold text-lg">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Background>
  );
}
