import React, { useRef } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { Upload } from '~/lib/icons/Upload';
import { Image } from 'expo-image';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';

const EXAMPLE_IDEAS = [
  {
    name: 'Love Language Timer',
    description: "Make a love language tracker for me and Jake to see who's more romantic",
  },
  {
    name: 'Study Session Aesthetic',
    description: 'Make me a kawaii study timer with lofi aesthetics',
  },
  {
    name: 'Situationship Calculator',
    description:
      "Make a situationship calculator that tells me if we're dating based on how many times we've hung out",
  },
  {
    name: 'Outfit Decision Maker',
    description: 'Make an outfit randomizer for my capsule wardrobe',
  },
  {
    name: 'Gym Split Randomizer',
    description: 'Make a workout generator for my gym bro Mark that gives him crazy exercises',
  },
];

interface FirstStepProps {
  name: string;
  description: string;
  icon: string | null;
  onNameChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  onPickImage: () => void;
}

export default function FirstStep({
  name,
  description,
  icon,
  onNameChange,
  onDescriptionChange,
  onPickImage,
}: FirstStepProps) {
  const descriptionInputRef = useRef<TextInput>(null);

  const handleDescriptionSubmit = () => {
    descriptionInputRef.current?.blur();
  };

  const renderExampleIdeas = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row -mx-6 px-6">
      {EXAMPLE_IDEAS.map((idea, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            onNameChange(idea.name);
            onDescriptionChange(idea.description);
          }}
          className="mr-3 px-5 py-3 rounded-full bg-primary/10 border border-primary/20">
          <Text className="text-base text-primary font-medium">{idea.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <Animated.View
      className="flex-1"
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(300)}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingBottom: 150 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="space-y-12">
            <View className="items-center">
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  onPress={onPickImage}
                  className="w-28 h-28 rounded-2xl bg-muted justify-center items-center overflow-hidden border-2 border-dashed border-border">
                  {icon ? (
                    <Image source={{ uri: icon }} className="w-full h-full" />
                  ) : (
                    <View className="items-center space-y-3">
                      <Upload size={28} className="text-muted-foreground" />
                      <Text className="text-base text-muted-foreground">Upload</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              <Text className="text-base text-muted-foreground mt-3">Choose an app icon</Text>
            </View>
            <View>
              <Text className="text-lg font-medium mb-2">App Name</Text>
              <Input
                value={name}
                onChangeText={onNameChange}
                className="bg-transparent text-lg py-3"
                placeholder="Enter your app name"
                returnKeyType="next"
                blurOnSubmit={false}
                bottomSheet
                onSubmitEditing={() => {
                  descriptionInputRef.current?.focus();
                }}
              />
            </View>
            <View>
              <Text className="text-lg font-medium mb-2 mt-2">App Idea</Text>
              <Input
                ref={descriptionInputRef}
                value={description}
                onChangeText={onDescriptionChange}
                multiline
                bottomSheet
                numberOfLines={4}
                className="min-h-[120] py-3 px-4 bg-transparent text-lg"
                textAlignVertical="top"
                placeholder="Describe your app idea"
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={handleDescriptionSubmit}
              />
              <View className="mt-6">
                <Text className="text-base text-muted-foreground mb-3">
                  Or try one of these examples:
                </Text>
                {renderExampleIdeas}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}
