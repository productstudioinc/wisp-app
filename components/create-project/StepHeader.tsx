import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Reset } from '~/lib/icons/Reset';

interface StepHeaderProps {
  step: number;
  hasGenerated: boolean;
  onReset: () => void;
}

export default function StepHeader({ step, hasGenerated, onReset }: StepHeaderProps) {
  return (
    <View className="h-14 mb-8 flex-row justify-between items-center">
      <Text className="text-4xl font-bold text-foreground">
        {step === 0 ? 'Create a New App' : 'Personalize Your App'}
      </Text>
      <View className="w-[76px]">
        {!hasGenerated && (
          <Button variant="ghost" onPress={onReset}>
            <Reset size={24} className="text-destructive" />
          </Button>
        )}
      </View>
    </View>
  );
}
