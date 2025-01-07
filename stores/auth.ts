import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const ONBOARDING_COMPLETE = "onboarding_complete";
const AUTH_TOKEN = "auth_token";

type AuthState = {
  isLoading: boolean;
  isOnboardingComplete: boolean;
  isAuthenticated: boolean;
  token: string | null;
  initializeAuth: () => Promise<void>;
  setOnboardingComplete: () => Promise<void>;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  isLoading: true,
  isOnboardingComplete: false,
  isAuthenticated: false,
  token: null,

  initializeAuth: async () => {
    try {
      const [onboardingStatus, authToken] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_COMPLETE),
        AsyncStorage.getItem(AUTH_TOKEN),
      ]);

      set({
        isOnboardingComplete: onboardingStatus === "true",
        isAuthenticated: !!authToken,
        token: authToken,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ isLoading: false });
    }
  },

  setOnboardingComplete: async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE, "true");
    set({ isOnboardingComplete: true });
  },

  signIn: async (token: string) => {
    await AsyncStorage.setItem(AUTH_TOKEN, token);
    set({ isAuthenticated: true, token });
  },

  signOut: async () => {
    await AsyncStorage.removeItem(AUTH_TOKEN);
    set({ isAuthenticated: false, token: null });
  },
}));
