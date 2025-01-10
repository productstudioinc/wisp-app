import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SubscriptionScreen() {
  const router = useRouter();
  const plans = [
    {
      period: 'Monthly',
      price: '$12.99/mo',
      isPopular: false,
    },
    {
      period: 'Yearly',
      price: '$3.33/mo',
      isPopular: true,
      savings: 'Save 75%',
      trial: '3 DAYS FREE',
    },
  ];

  const handleContinue = () => {
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 mt-12">
        <Text className="text-4xl font-bold mb-2 text-foreground">
          Start your 3-day FREE trial to continue.
        </Text>

        <View className="mt-8">
          <View className="relative">
            <View className="absolute left-[23px] top-5 bottom-12 w-[6px]">
              <View className="w-full h-1/2 bg-primary rounded-full" />
              <View className="w-full h-1/2 bg-muted rounded-full" />
            </View>

            <View className="flex-row items-center mb-12 gap-y-12">
              <View className="h-14 w-14 bg-primary rounded-full items-center justify-center mr-4 z-10">
                <Text className="text-primary-foreground text-2xl">🔓</Text>
              </View>
              <View>
                <Text className="text-2xl font-semibold text-foreground">Today</Text>
                <Text className="text-muted-foreground text-lg">Unlock all the app's features</Text>
              </View>
            </View>

            <View className="flex-row items-center mb-12">
              <View className="h-14 w-14 bg-primary rounded-full items-center justify-center mr-4 z-10">
                <Text className="text-primary-foreground text-2xl">🔔</Text>
              </View>
              <View>
                <Text className="text-2xl font-semibold text-foreground">In 2 Days - Reminder</Text>
                <Text className="text-muted-foreground text-lg">We'll send you a reminder</Text>
              </View>
            </View>

            <View className="flex-row items-center mb-12">
              <View className="h-14 w-14 bg-primary rounded-full items-center justify-center mr-4 z-10">
                <Text className="text-primary-foreground text-2xl">👑</Text>
              </View>
              <View>
                <Text className="text-2xl font-semibold text-foreground">
                  In 3 Days - Billing Starts
                </Text>
                <Text className="text-muted-foreground text-lg">Cancel anytime before</Text>
              </View>
            </View>
          </View>
        </View>
        <View className="flex-row gap-4 mb-8 mt-auto">
          <TouchableOpacity className="flex-1 p-4 rounded-xl border-2 border-border">
            <Text className="text-foreground text-sm">Monthly</Text>
            <Text className="text-foreground text-base font-semibold">$12.99/mo</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 p-4 rounded-xl border-2 border-primary bg-primary">
            <View className="absolute -top-3 right-4 bg-primary px-3 py-1 rounded-full">
              <Text className="text-primary-foreground text-xs">BEST DEAL</Text>
            </View>
            <Text className="text-primary-foreground text-sm">Yearly</Text>
            <Text className="text-primary-foreground text-base font-semibold">$3.33/mo</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-muted-foreground mb-4">No Payment Due Now</Text>
      </View>

      <View className="px-6 pb-8">
        <TouchableOpacity className="bg-primary py-4 rounded-full" onPress={handleContinue}>
          <Text className="text-primary-foreground text-center font-semibold text-lg">
            Start My 3-Day Free Trial
          </Text>
        </TouchableOpacity>
        <Text className="text-muted-foreground text-sm text-center mt-2">
          3 days free, then $39.99 per year ($3.33/mo)
        </Text>
      </View>
    </SafeAreaView>
  );
}
