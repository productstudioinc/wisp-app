import { supabase } from '@/supabase/client';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import { Platform, View, useColorScheme } from 'react-native';

export function Auth() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  if (Platform.OS === 'ios')
    return (
      <View className="overflow-hidden rounded-full">
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={
            colorScheme === 'dark'
              ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
              : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
          }
          cornerRadius={0}
          style={{ width: '100%', height: 48 }}
          onPress={async () => {
            try {
              const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                  AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                  AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
              });
              // Sign in via Supabase Auth.
              if (credential.identityToken) {
                const {
                  error,
                  data: { user },
                } = await supabase.auth.signInWithIdToken({
                  provider: 'apple',
                  token: credential.identityToken,
                });
                console.log(JSON.stringify({ error, user }, null, 2));
                if (!error) {
                  // Navigate to onboarding after successful sign in
                  router.replace('/onboarding');
                }
              } else {
                throw new Error('No identityToken.');
              }
            } catch (e) {
              if (e instanceof Error && e.message === 'ERR_REQUEST_CANCELED') {
                // handle that the user canceled the sign-in flow
              } else {
                // handle other errors
              }
            }
          }}
        />
      </View>
    );
  return <>{/* Implement Android Auth options. */}</>;
}
