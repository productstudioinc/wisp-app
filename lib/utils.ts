import { clsx, type ClassValue } from 'clsx';
import Constants from 'expo-constants';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateAPIUrl = (relativePath: string) => {
  const origin = Constants.expoConfig?.extra?.router?.origin
    ? Constants.expoConfig?.extra?.router?.origin.replace('exp://', 'http://')
    : 'http://localhost:8081';

  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

  if (process.env.NODE_ENV === 'development') {
    return origin.concat(path);
  }

  if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL environment variable is not defined');
  }

  return process.env.EXPO_PUBLIC_API_BASE_URL.concat(path);
};
