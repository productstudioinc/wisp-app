import { clsx, type ClassValue } from 'clsx';
import Constants from 'expo-constants';
import { twMerge } from 'tailwind-merge';
import { Share } from 'react-native';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateAPIUrl = (relativePath: string) => {
  if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL environment variable is not defined');
  }

  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return process.env.EXPO_PUBLIC_API_BASE_URL.concat(path);
};

export const formatUrl = (url: string | null) => {
  if (!url) return null;
  return url.startsWith('http') ? url : `https://${url}`;
};

export const shareUrl = async (url: string | null, title: string) => {
  if (!url) return;

  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const formattedUrl = formatUrl(url);
  if (!formattedUrl) return;

  try {
    const message = `Check out this app I made! ${formattedUrl}`;
    await Share.share({
      message,
      title,
    });
  } catch (error) {
    console.error('Error sharing:', error);
  }
};

export const openUrl = async (url: string | null) => {
  if (!url) return;

  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const formattedUrl = formatUrl(url);
  if (!formattedUrl) return;

  try {
    const canOpen = await Linking.canOpenURL(formattedUrl);
    if (canOpen) {
      await Linking.openURL(formattedUrl);
    } else {
      console.warn('Cannot open URL:', formattedUrl);
    }
  } catch (error) {
    console.error('Error opening URL:', error);
  }
};
