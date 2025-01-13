import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { IconHome, IconHomeFilled } from '@tabler/icons-react-native';
import { cssInterop } from 'nativewind';
import { FontAwesome6 } from '@expo/vector-icons';

cssInterop(IconHome, {
  className: {
    target: 'style',
  },
});

cssInterop(IconHomeFilled, {
  className: {
    target: 'style',
  },
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size, focused }) => (
            <FontAwesome6
              name="house"
              size={20}
              color={color}
              style={{
                marginBottom: -4,
                opacity: focused ? 1 : 0.5,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size, focused }) => (
            <FontAwesome6
              name="compass"
              size={20}
              color={color}
              style={{
                marginBottom: -4,
                opacity: focused ? 1 : 0.5,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarShowLabel: false,
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6
              name="gear"
              size={20}
              color={color}
              style={{
                marginBottom: -4,
                opacity: focused ? 1 : 0.5,
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
