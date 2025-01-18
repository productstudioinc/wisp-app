import { supabase } from '@/supabase/client';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View, Linking, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '~/components/ui/background';
import { ThemeToggle } from '~/components/ThemeToggle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Button } from '~/components/ui/button';

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
          {/* Header */}
          <View className="py-6">
            <Text className="text-4xl font-title text-foreground">Settings</Text>
            <Text className="text-xl text-muted-foreground mt-1">Manage your preferences</Text>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* App Preferences */}
            <View className="backdrop-blur-md rounded-2xl p-5 mb-5">
              <Text className="text-lg font-semibold text-foreground mb-6">App Preferences</Text>

              <View className="space-y-8">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-base font-medium text-foreground">Theme</Text>
                    <Text className="text-sm text-muted-foreground mt-1">
                      Toggle between light, dark, or system theme
                    </Text>
                  </View>
                  <ThemeToggle />
                </View>

                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-base font-medium text-foreground">Private Projects</Text>
                    <Text className="text-sm text-muted-foreground mt-1">
                      Make new projects private by default
                    </Text>
                  </View>
                  <Switch value={privateByDefault} onValueChange={handlePrivateToggle} />
                </View>

                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-base font-medium text-foreground">
                      Push Notifications
                    </Text>
                    <Text className="text-sm text-muted-foreground mt-1">
                      Get notified about project updates
                    </Text>
                  </View>
                  <Switch value={notificationsEnabled} onValueChange={handleNotificationsToggle} />
                </View>
              </View>
            </View>

            {/* Account Information */}
            <View className="backdrop-blur-md rounded-2xl p-5 mb-5">
              <Text className="text-lg font-semibold text-foreground mb-4">Account</Text>

              {email && (
                <View>
                  <Text className="text-sm text-muted-foreground">Email</Text>
                  <Text className="text-base font-medium text-foreground mt-1">{email}</Text>
                </View>
              )}
            </View>

            {/* App Information */}
            <View className="backdrop-blur-md rounded-2xl p-5 mb-5">
              <Text className="text-lg font-semibold text-foreground mb-4">About</Text>

              <View className="space-y-5">
                <View className="flex-row justify-between items-center">
                  <Text className="text-base font-medium text-foreground">Version</Text>
                  <Text className="text-base text-muted-foreground">
                    {Constants.expoConfig?.version}
                  </Text>
                </View>

                <TouchableOpacity
                  className="flex-row justify-between items-center"
                  onPress={() => openLink('https://yourapp.com/terms')}>
                  <Text className="text-base font-medium text-foreground">Terms of Service</Text>
                  <Text className="text-base text-primary">View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row justify-between items-center"
                  onPress={() => openLink('https://yourapp.com/privacy')}>
                  <Text className="text-base font-medium text-foreground">Privacy Policy</Text>
                  <Text className="text-base text-primary">View</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Danger Zone */}
            <View className="mb-5">
              <Button
                variant="destructive"
                className="mb-3 rounded-full"
                onPress={() =>
                  supabase.auth.signOut().then(() => router.replace('/(auth)/welcome'))
                }>
                <Text className="text-center text-destructive-foreground font-semibold text-lg">
                  Sign Out
                </Text>
              </Button>

              <Button
                variant="destructive"
                className="rounded-full bg-destructive/10"
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
                <Text className="text-center text-destructive font-semibold text-lg">
                  Delete Account
                </Text>
              </Button>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Background>
  );
}
