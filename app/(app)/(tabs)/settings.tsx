import { supabase } from '@/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeToggle } from '~/components/ThemeToggle';
import { Background } from '~/components/ui/background';
import { Button } from '~/components/ui/button';
import { useColorScheme } from '~/lib/useColorScheme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

export default function SettingsScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [privateByDefault, setPrivateByDefault] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { isDarkColorScheme } = useColorScheme();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined,
  );
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();
  const [devModeCount, setDevModeCount] = useState(0);
  const [devModeEnabled, setDevModeEnabled] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ''))
      .catch((error: any) => setExpoPushToken(`${error}`));

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

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

  useEffect(() => {
    if (devModeCount >= 10) {
      setDevModeEnabled(true);
    }
  }, [devModeCount]);

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
            <TouchableOpacity onPress={() => setDevModeCount((count) => count + 1)}>
              <Text className="text-4xl font-title text-foreground">Settings</Text>
              <Text className="text-xl text-muted-foreground mt-1">Manage your preferences</Text>
            </TouchableOpacity>
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
                  <Switch
                    value={privateByDefault}
                    onValueChange={handlePrivateToggle}
                    trackColor={{
                      true: isDarkColorScheme ? '#3f3f46' : '#000000',
                      false: isDarkColorScheme ? '#27272A' : '#E5E5E5',
                    }}
                  />
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
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={handleNotificationsToggle}
                    trackColor={{
                      true: isDarkColorScheme ? '#3f3f46' : '#000000',
                      false: isDarkColorScheme ? '#27272A' : '#E5E5E5',
                    }}
                  />
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
                  onPress={() => openLink('https://usewisp.app/terms')}>
                  <Text className="text-base font-medium text-foreground">Terms of Service</Text>
                  <Text className="text-base text-primary">View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row justify-between items-center"
                  onPress={() => openLink('https://usewisp.app/privacy')}>
                  <Text className="text-base font-medium text-foreground">Privacy Policy</Text>
                  <Text className="text-base text-primary">View</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Send Test Notification */}
            {devModeEnabled && (
              <Button
                variant="default"
                className="mb-3 rounded-full"
                onPress={async () => {
                  await sendPushNotification(expoPushToken);
                }}>
                <Text className="text-center text-destructive-foreground font-semibold text-lg">
                  Send Test Notification
                </Text>
              </Button>
            )}

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
