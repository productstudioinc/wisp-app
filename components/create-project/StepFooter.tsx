import React from 'react';
import { View } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { ChevronLeft } from '~/lib/icons/ChevronLeft';
import { Pagination } from '~/components/pagination';
import { SharedValue } from 'react-native-reanimated';

interface StepFooterProps {
  step: number;
  progress: SharedValue<number>;
  isLoading: boolean;
  hasGenerated: boolean;
  canContinue: boolean;
  onBack: () => void;
  onNext: () => void;
}

export default function StepFooter({
  step,
  progress,
  isLoading,
  hasGenerated,
  canContinue,
  onBack,
  onNext,
}: StepFooterProps) {
  return (
    <View className="bg-background">
      <View className="pt-4 mb-4">
        <Pagination
          data={[0, 1]}
          progress={progress}
          dotClassName="rounded-full bg-muted mx-1"
          activeDotClassName="rounded-full bg-primary"
        />
      </View>

      <View className="flex-row mb-8">
        {step > 0 && (
          <Button onPress={onBack} className="rounded-full mr-2 h-10 w-12" variant="ghost">
            <ChevronLeft size={24} className="text-primary" />
          </Button>
        )}
        <Button
          className={`flex-1 rounded-full ${canContinue ? 'bg-primary' : 'bg-muted'}`}
          size="lg"
          onPress={onNext}
          disabled={!canContinue || isLoading}>
          <Text
            className={`text-center font-semibold ${
              canContinue ? 'text-primary-foreground' : 'text-muted-foreground'
            }`}>
            {step === 0
              ? hasGenerated
                ? 'Continue'
                : 'Generate'
              : isLoading
                ? 'Creating...'
                : 'Create Project'}
          </Text>
        </Button>
      </View>
    </View>
  );
}
