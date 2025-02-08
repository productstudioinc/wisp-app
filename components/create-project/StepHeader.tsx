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
    <View className={`h-14 flex-row justify-between items-center ${step === 0 ? 'mb-8' : ''}`}>
      <Text className="text-2xl font-title text-foreground">
        {step === 0 ? 'Create a New App' : 'Personalize Your App'}
      </Text>

      {!hasGenerated && (
        <Button variant="ghost" onPress={onReset} size="icon">
          <Reset size={24} className="text-destructive" />
        </Button>
      )}
    </View>
  );
}
