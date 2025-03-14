import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import ImageStack from './ImageStack';

interface Question {
  id: string;
  question: string;
  answer: string;
}

interface SecondStepProps {
  questions: Question[];
  imagesDescription: string[];
  imageSuggestions: string;
  onQuestionAnswer: (id: string, answer: string) => void;
  onImagesChange: (newImages: string[]) => void;
  onAddImages: () => void;
}

export default function SecondStep({
  questions,
  imagesDescription,
  imageSuggestions,
  onQuestionAnswer,
  onImagesChange,
  onAddImages,
}: SecondStepProps) {
  return (
    <View className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingBottom: 150 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="gap-y-6">
            <Text className="text-base text-muted-foreground">
              These questions are optional and help personalize your app generation
            </Text>
            <View className="gap-y-6">
              {questions.map((q) => (
                <View key={q.id}>
                  <Text className="text-base font-medium mb-3">{q.question}</Text>
                  <Input
                    defaultValue={q.answer}
                    onEndEditing={(e) => onQuestionAnswer(q.id, e.nativeEvent.text)}
                    placeholder="Your answer"
                    multiline
                    bottomSheet
                    textAlignVertical="top"
                  />
                </View>
              ))}
            </View>

            {/* <View className="space-y-4">
              <Text className="text-xl font-medium">Reference Images</Text>

              {imageSuggestions && (
                <View className="bg-muted/50 p-4 rounded-2xl">
                  <Text className="text-base text-foreground">{imageSuggestions}</Text>
                </View>
              )}

              <ImageStack
                images={imagesDescription}
                onReorder={onImagesChange}
                onAddImages={onAddImages}
              />
            </View> */}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
