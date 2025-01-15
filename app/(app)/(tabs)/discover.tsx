import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '~/components/ui/background';

export default function DiscoverScreen() {
  return (
    <Background>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-1 px-6 py-12">
          <Text className="text-4xl font-bold mb-2 text-foreground">Discover</Text>
          <Text className="text-lg text-muted-foreground mb-8">
            Find inspiration for your next project
          </Text>
        </View>
      </SafeAreaView>
    </Background>
  );
}
