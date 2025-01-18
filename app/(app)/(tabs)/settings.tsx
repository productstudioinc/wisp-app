import { supabase } from '@/supabase/client';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View, Linking, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '~/components/ui/background';
import { ThemeToggle } from '~/components/ThemeToggle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [privateByDefault, setPrivateByDefault] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });

    AsyncStorage.getItem('privateByDefault').then((value) => {
      setPrivateByDefault(value === 'true');
    });

    AsyncStorage.getItem('notificationsEnabled').then((value) => {
      setNotificationsEnabled(value === 'true');
    });
  }, []);

  const handlePrivateToggle = async (value: boolean) => {
    setPrivateByDefault(value);
    await AsyncStorage.setItem('privateByDefault', value.toString());
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('notificationsEnabled', value.toString());
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Error opening link:', err));
  };

  return (
    <Background>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-1 px-6">
          <View className="py-6">
            <Text className="text-4xl font-title mb-3 text-foreground">Settings</Text>
            <Text className="text-xl text-muted-foreground">Manage your preferences</Text>
          </View>

          {/* App Preferences */}
          <View className="mb-8">
            <Text className="text-lg font-medium text-foreground mb-4">App Preferences</Text>

            <View className="space-y-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-foreground">Dark Mode</Text>
                <ThemeToggle />
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-base text-foreground">Private Projects by Default</Text>
                <Switch value={privateByDefault} onValueChange={handlePrivateToggle} />
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-base text-foreground">Push Notifications</Text>
                <Switch value={notificationsEnabled} onValueChange={handleNotificationsToggle} />
              </View>
            </View>
          </View>

          {/* Account Information */}
          <View className="mb-8">
            <Text className="text-lg font-medium text-foreground mb-4">Account</Text>

            {email && (
              <View className="bg-card/80 backdrop-blur-md p-4 rounded-lg mb-4">
                <Text className="text-sm text-muted-foreground">Email</Text>
                <Text className="text-base text-foreground">{email}</Text>
              </View>
            )}
          </View>

          {/* App Information */}
          <View className="mb-8">
            <Text className="text-lg font-medium text-foreground mb-4">About</Text>

            <View className="space-y-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-foreground">Version</Text>
                <Text className="text-base text-muted-foreground">
                  {Constants.expoConfig?.version}
                </Text>
              </View>

              <TouchableOpacity
                className="flex-row justify-between items-center"
                onPress={() => openLink('https://yourapp.com/terms')}>
                <Text className="text-base text-foreground">Terms of Service</Text>
                <Text className="text-base text-primary">View</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row justify-between items-center"
                onPress={() => openLink('https://yourapp.com/privacy')}>
                <Text className="text-base text-foreground">Privacy Policy</Text>
                <Text className="text-base text-primary">View</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Danger Zone */}
          <View className="mt-auto mb-8">
            <TouchableOpacity
              className="bg-destructive py-4 px-6 rounded-full mb-4"
              onPress={() => supabase.auth.signOut().then(() => router.replace('/(auth)/welcome'))}>
              <Text className="text-center text-destructive-foreground font-semibold text-xl">
                Sign Out
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-destructive/10 py-4 px-6 rounded-full"
              onPress={() => {
                Alert.alert(
                  'Delete Account',
                  'Are you sure you want to delete your account? This action cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        const {
                          data: { user },
                        } = await supabase.auth.getUser();
                        if (!user) return;
                        try {
                          await fetch(`/api/delete?userId=${user.id}`);
                          await supabase.auth.signOut();
                          router.replace('/(auth)/welcome');
                        } catch (error) {
                          Alert.alert('Error', 'Failed to delete account. Please try again.');
                        }
                      },
                    },
                  ],
                );
              }}>
              <Text className="text-center text-destructive font-semibold text-xl">
                Delete Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Background>
  );
}
