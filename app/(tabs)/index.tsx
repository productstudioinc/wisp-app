import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <ThemedView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold">Home Screen</Text>
      </View>
    </ThemedView>
  );
}
