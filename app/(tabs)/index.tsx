import { Auth } from '@/components/Auth.native';
import Superwall from '@superwall/react-native-superwall';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold">Home Screen</Text>
        <Auth />

        <TouchableOpacity
        // onPress={() => {
        //   Superwall.shared.register('pressedPaywall').then(() => {
        //     // presentLogCaffeine();
        //   });
        // }}
        >
          <Text>Log Caffeine</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
