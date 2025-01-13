import { supabase } from '@/supabase/client';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/welcome');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-12">
        <Text className="text-4xl font-bold mb-2 text-foreground">Home</Text>
        <Text className="text-lg text-muted-foreground mb-8">Welcome to your dashboard</Text>

        <TouchableOpacity className="bg-destructive py-4 rounded-full" onPress={handleSignOut}>
          <Text className="text-center text-destructive-foreground font-semibold text-lg">
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
