import { Pressable, View } from 'react-native';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { MoonStar } from '~/lib/icons/MoonStar';
import { Sun } from '~/lib/icons/Sun';
import { Monitor } from '~/lib/icons/Monitor';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/utils';
import { useCallback } from 'react';

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const cycleColorScheme = useCallback(() => {
    switch (colorScheme) {
      case 'light':
        setColorScheme('dark');
        setAndroidNavigationBar('dark');
        break;
      case 'dark':
        setColorScheme('system');
        setAndroidNavigationBar('dark');
        break;
      default:
        setColorScheme('light');
        setAndroidNavigationBar('light');
    }
  }, [colorScheme, setColorScheme]);

  return (
    <Pressable
      onPress={cycleColorScheme}
      className="web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2">
      {({ pressed }) => (
        <View
          className={cn(
            'flex-1 aspect-square pt-0.5 justify-center items-start web:px-5',
            pressed && 'opacity-70',
          )}>
          {colorScheme === 'dark' ? (
            <MoonStar className="text-foreground" size={23} strokeWidth={1.25} />
          ) : colorScheme === 'light' ? (
            <Sun className="text-foreground" size={24} strokeWidth={1.25} />
          ) : (
            <Monitor className="text-foreground" size={24} strokeWidth={1.25} />
          )}
        </View>
      )}
    </Pressable>
  );
}
