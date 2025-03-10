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
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

const EXAMPLE_IDEAS = [
  {
    name: 'Study Session Aesthetic',
    description: 'Make me a kawaii study timer with lofi aesthetics and character rewards',
  },
  {
    name: 'Couples Daily Message',
    description:
      'Create a love message generator for my girlfriend Emma that gives her a new reason I love her every day',
  },
  {
    name: 'Random Outfit Picker',
    description: 'Make a simple outfit randomizer that helps me decide what to wear to class',
  },
  {
    name: 'Morning Routine Randomizer',
    description: 'Create a morning routine spinner that makes getting ready for class more fun',
  },
  {
    name: 'Simple Workout Generator',
    description:
      'Make a basic workout generator that creates random exercise combinations for my dorm room',
  },
  {
    name: 'Daily Gratitude Prompt',
    description: 'Create a daily gratitude prompt generator with cute positive themes',
  },
  {
    name: 'Excuse Generator',
    description: 'Make a random excuse generator for when I sleep through my 8am class',
  },
  {
    name: 'Study Break Timer',
    description:
      'Create a study break timer that gives me fun 5-minute challenges between sessions',
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
  const nameInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  const handleDescriptionSubmit = () => {
    const text = descriptionInputRef.current?.props.defaultValue as string;
    if (text !== undefined) {
      onDescriptionChange(text);
    }
    descriptionInputRef.current?.blur();
  };

  const handleNameSubmit = () => {
    const text = nameInputRef.current?.props.defaultValue as string;
    if (text !== undefined) {
      onNameChange(text);
    }
    descriptionInputRef.current?.focus();
  };

  const renderExampleIdeas = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-row -mx-6 px-6 pb-2"
      contentContainerStyle={{ paddingRight: 24 }}>
      {EXAMPLE_IDEAS.map((idea, index) => (
        <Button
          key={index}
          variant="secondary"
          onPress={() => {
            if (nameInputRef.current) {
              nameInputRef.current.setNativeProps({ text: idea.name });
              onNameChange(idea.name);
            }
            if (descriptionInputRef.current) {
              descriptionInputRef.current.setNativeProps({ text: idea.description });
              onDescriptionChange(idea.description);
            }
          }}
          className="mr-3 px-4 py-2.5 rounded-full border border-border">
          <Text className="text-base font-medium">{idea.name}</Text>
        </Button>
      ))}
    </ScrollView>
  );

  return (
    <View className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingBottom: 150 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="gap-y-4">
            <View className="items-center">
              <View className="flex-row gap-x-4">
                <TouchableOpacity
                  onPress={onPickImage}
                  className="w-24 h-24 rounded-2xl bg-muted justify-center items-center overflow-hidden border-2 border-dashed border-border">
                  {icon ? (
                    <Image
                      source={{ uri: icon }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <View className="items-center gap-y-2">
                      <Upload size={24} className="text-muted-foreground" />
                      <Text className="text-base text-muted-foreground">Upload</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              <Text className="text-base text-muted-foreground mt-3">Choose an app icon</Text>
            </View>
            <View className="gap-y-3">
              <Text className="text-base font-medium">
                App Name <Text className="text-red-500">*</Text>
              </Text>
              <Input
                ref={nameInputRef}
                defaultValue={name}
                onChangeText={onNameChange}
                onEndEditing={(e) => onNameChange(e.nativeEvent.text)}
                placeholder="Enter your app name"
                returnKeyType="next"
                blurOnSubmit={false}
                bottomSheet
                enablesReturnKeyAutomatically
                onSubmitEditing={handleNameSubmit}
              />
            </View>
            <View className="gap-y-3">
              <Text className="text-base font-medium">
                App Idea <Text className="text-red-500">*</Text>
              </Text>
              <Textarea
                ref={descriptionInputRef}
                defaultValue={description}
                onChangeText={onDescriptionChange}
                onEndEditing={(e) => onDescriptionChange(e.nativeEvent.text)}
                multiline
                bottomSheet
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="Describe your app idea"
                returnKeyType="default"
                blurOnSubmit={false}
                enablesReturnKeyAutomatically={false}
              />
              <View className="mt-2 gap-y-3">
                <Text className="text-base text-muted-foreground">
                  Or try one of these examples:
                </Text>
                {renderExampleIdeas}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
