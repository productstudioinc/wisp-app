import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '~/components/ui/background';

export default function DiscoverScreen() {
  return (
    <Background>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-1 px-6">
          <View className="py-6">
            <Text className="text-4xl font-bold mb-3 text-foreground">Discover</Text>
            <Text className="text-xl text-muted-foreground">
              Find inspiration for your next project
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Background>
  );
}
