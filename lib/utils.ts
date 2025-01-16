import { clsx, type ClassValue } from 'clsx';
import Constants from 'expo-constants';
import { twMerge } from 'tailwind-merge';

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
