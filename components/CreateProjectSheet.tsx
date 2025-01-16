import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { Pagination } from '~/components/pagination';
import { supabase } from '~/supabase/client';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  SlideInRight,
  SlideOutLeft,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  useAnimatedStyle,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import { Upload } from '~/lib/icons/Upload';
import { ChevronLeft } from '~/lib/icons/ChevronLeft';
import { vars, useColorScheme } from 'nativewind';
import { Image } from 'expo-image';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetch } from 'expo/fetch';
import { generateAPIUrl } from '~/lib/utils';
import { Reset } from '~/lib/icons/Reset';

interface Question {
  id: string;
  question: string;
  answer: string;
}

interface CreateProjectFormData {
  name: string;
  description: string;
  prompt: string;
  icon: string | null;
  isGeneratingIcon: boolean;
  questions: Question[];
  imagesDescription: string[];
  imageSuggestions: string;
}

const INITIAL_QUESTIONS = [
  {
    id: '1',
    question: 'Who is your target audience?',
    answer: '',
  },
  {
    id: '2',
    question: 'What are the most important features you need?',
    answer: '',
  },
  {
    id: '3',
    question: 'What inspired this app idea?',
    answer: '',
  },
];

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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48; // 24px padding on each side
const MAX_ROTATION = 7;

interface CreateProjectSheetProps {
  onPresentRef?: (present: () => void) => void;
}

const ImageCard = ({
  uri,
  index,
  totalCards,
  onSwipe,
}: {
  uri: string;
  index: number;
  totalCards: number;
  onSwipe: (direction: 'left' | 'right') => void;
}) => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const rotation = useSharedValue((Math.random() * 2 - 1) * 3);
  const scale = useSharedValue(1 - index * 0.05);
  const [isSwiped, setIsSwiped] = useState(false);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      if (isSwiped) return;
      x.value = e.translationX;
      y.value = e.translationY;
    })
    .onEnd((e) => {
      if (isSwiped) return;
      if (Math.abs(e.velocityX) > 500) {
        setIsSwiped(true);
        const direction = e.velocityX > 0 ? 'right' : 'left';
        x.value = withSpring(Math.sign(e.velocityX) * SCREEN_WIDTH * 1.5, {}, () => {
          onSwipe(direction);
        });
        y.value = withSpring(0);
      } else {
        x.value = withSpring(0);
        y.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: x.value },
        { translateY: y.value },
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
      zIndex: totalCards - index,
    };
  });

  useEffect(() => {
    if (!isSwiped) {
      x.value = withSpring(0);
      y.value = withSpring(0);
      rotation.value = (Math.random() * 2 - 1) * 3;
      scale.value = 1 - index * 0.05;
    }
  }, [index]);

  if (isSwiped) return null;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        className="absolute"
        style={[
          {
            width: CARD_WIDTH,
            height: CARD_WIDTH,
            backgroundColor: 'white',
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
          animatedStyle,
        ]}>
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%' }}
          className="rounded-2xl"
          contentFit="cover"
        />
      </Animated.View>
    </GestureDetector>
  );
};

const ImageStack = ({
  images,
  onReorder,
}: {
  images: string[];
  onReorder: (newImages: string[]) => void;
}) => {
  const handleSwipe = (index: number, direction: 'left' | 'right') => {
    const newImages = [...images];
    const [removed] = newImages.splice(index, 1);
    newImages.push(removed);
    onReorder(newImages);
  };

  return (
    <View className="h-[400] items-center justify-center">
      {images.map((uri, index) => (
        <ImageCard
          key={uri}
          uri={uri}
          index={index}
          totalCards={images.length}
          onSwipe={(direction) => handleSwipe(index, direction)}
        />
      ))}
      {images.length === 0 && (
        <View className="w-full h-[400] rounded-2xl bg-muted justify-center items-center border-2 border-dashed border-border">
          <Upload size={32} className="text-muted-foreground" />
          <Text className="text-base text-muted-foreground mt-4">Add reference images</Text>
          <Text className="text-sm text-muted-foreground mt-1">Swipe to reorder</Text>
        </View>
      )}
    </View>
  );
};

export function CreateProjectSheet({ onPresentRef }: CreateProjectSheetProps) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [formData, setFormData] = useState<CreateProjectFormData>({
    name: '',
    description: '',
    prompt: '',
    icon: null,
    isGeneratingIcon: false,
    questions: INITIAL_QUESTIONS,
    imagesDescription: [],
    imageSuggestions: '',
  });
  const progress = useSharedValue(0);
  const { colorScheme } = useColorScheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const floatAnim = useSharedValue(0);
  const rotateAnim = useSharedValue(0);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [shouldRegenerate, setShouldRegenerate] = useState(false);

  const [firstPageSnapshot, setFirstPageSnapshot] = useState({
    name: '',
    description: '',
  });

  const snapPoints = useMemo(() => ['80%'], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  useEffect(() => {
    if (onPresentRef) {
      onPresentRef(handlePresentModalPress);
    }
  }, [onPresentRef, handlePresentModalPress]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      resetForm();
    }
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
    ),
    [],
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData({ ...formData, icon: result.assets[0].uri });
    }
  };

  // Reset form when navigating away
  useFocusEffect(
    useCallback(() => {
      return () => {
        bottomSheetModalRef.current?.dismiss();
        resetForm();
      };
    }, []),
  );

  useEffect(() => {
    if (isTransitioning) {
      floatAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );

      rotateAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      );
    } else {
      floatAnim.value = 0;
      rotateAnim.value = 0;
    }
  }, [isTransitioning]);

  const floatingStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: floatAnim.value * -15 },
        { rotate: `${(rotateAnim.value - 0.5) * 6}deg` },
      ],
    };
  });

  const handleNext = async () => {
    if (step === 0 && (!formData.name || !formData.description)) {
      return;
    }

    const hasContentChanged =
      formData.name !== firstPageSnapshot.name ||
      formData.description !== firstPageSnapshot.description;

    if (!hasGenerated) {
      // First time, always show loading
      setIsTransitioning(true);
      setFirstPageSnapshot({
        name: formData.name,
        description: formData.description,
      });

      const apiUrl = generateAPIUrl('/api/refine');

      console.log(apiUrl);

      try {
        const response = await fetch(generateAPIUrl('/api/refine'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to refine project');
        }

        const data = await response.json();

        setFormData((prev) => ({
          ...prev,
          questions: data.questions.map((question: string, index: number) => ({
            id: (index + 1).toString(),
            question,
            answer: '',
          })),
        }));

        setIsTransitioning(false);
        setStep(1);
        setHasGenerated(true);
        progress.value = 1;
      } catch (error) {
        console.error('Error refining project:', error);
        setIsTransitioning(false);
      }
    } else {
      // Already generated before, just navigate
      setStep(1);
      progress.value = 1;
    }
  };

  const handleBack = () => {
    setStep(0);
    progress.value = 0;
  };

  const resetForm = () => {
    setStep(0);
    setHasGenerated(false);
    setShouldRegenerate(true);
    progress.value = 0;
    setFirstPageSnapshot({
      name: '',
      description: '',
    });
    setFormData({
      name: '',
      description: '',
      prompt: '',
      icon: null,
      isGeneratingIcon: false,
      questions: INITIAL_QUESTIONS,
      imagesDescription: [],
      imageSuggestions: '',
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { error } = await supabase.from('projects').insert({
        name: formData.name,
        prompt: formData.prompt,
        status: 'creating',
        user_id: userData.user.id,
        project_id: crypto.randomUUID(),
      });

      if (error) throw error;

      bottomSheetModalRef.current?.dismiss();
      resetForm();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canContinue = () => {
    if (step === 0) {
      return !!formData.name && !!formData.description;
    }
    return formData.questions.every((q) => !!q.answer);
  };

  const handleGenerateIcon = async () => {
    setFormData((prev) => ({ ...prev, isGeneratingIcon: true }));
    // TODO: Implement AI icon generation
    // For now, just simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setFormData((prev) => ({ ...prev, isGeneratingIcon: false }));
  };

  const renderExampleIdeas = useMemo(
    () => (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row -mx-6 px-6">
        {EXAMPLE_IDEAS.map((idea, index) => (
          <TouchableOpacity
            key={index}
            onPress={() =>
              setFormData((prev) => ({
                ...prev,
                name: idea.name,
                description: idea.description,
              }))
            }
            className="mr-3 px-5 py-3 rounded-full bg-primary/10 border border-primary/20">
            <Text className="text-base text-primary font-medium">{idea.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    ),
    [],
  );

  const handleNameChange = useCallback((text: string) => {
    setFormData((prev) => ({ ...prev, name: text }));
  }, []);

  const handleDescriptionChange = useCallback((text: string) => {
    setFormData((prev) => ({ ...prev, description: text }));
  }, []);

  const handleDescriptionSubmit = () => {
    Keyboard.dismiss();
  };

  // Load saved form data
  useEffect(() => {
    async function loadSavedForm() {
      try {
        const savedForm = await AsyncStorage.getItem('createProjectForm');
        if (savedForm) {
          setFormData(JSON.parse(savedForm));
        }
      } catch (error) {
        console.error('Failed to load saved form:', error);
      }
    }
    loadSavedForm();
  }, []);

  // Save form data when it changes
  useEffect(() => {
    async function saveForm() {
      try {
        await AsyncStorage.setItem('createProjectForm', JSON.stringify(formData));
      } catch (error) {
        console.error('Failed to save form:', error);
      }
    }
    saveForm();
  }, [formData]);

  const handleQuestionAnswer = (id: string, answer: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, answer } : q)),
    }));
  };

  const handleReset = () => {
    Alert.alert(
      'Are you sure you want to reset?',
      'This will reset your app idea and your personalized questions',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetForm,
        },
      ],
    );
  };

  const pickMultipleImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 1,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setFormData((prev) => ({
        ...prev,
        imagesDescription: [...prev.imagesDescription, ...newImages].slice(0, 5),
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imagesDescription: prev.imagesDescription.filter((_, i) => i !== index),
    }));
  };

  const renderFirstStep = useMemo(
    () => (
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
                    onPress={pickImage}
                    className="w-28 h-28 rounded-2xl bg-muted justify-center items-center overflow-hidden border-2 border-dashed border-border">
                    {formData.icon ? (
                      <Image source={{ uri: formData.icon }} className="w-full h-full" />
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
                  defaultValue={formData.name}
                  onChangeText={handleNameChange}
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
                  defaultValue={formData.description}
                  onChangeText={handleDescriptionChange}
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
    ),
    [
      formData.name,
      formData.description,
      handleNameChange,
      handleDescriptionChange,
      renderExampleIdeas,
    ],
  );

  const renderLoadingStep = () => (
    <View className="flex-1 items-center justify-center px-6">
      <View className="items-center space-y-4 -mt-20">
        <Animated.View style={floatingStyle}>
          {isImageLoaded && (
            <View className="shadow-lg shadow-primary/20">
              <Image
                source={require('~/assets/images/icon-wand.png')}
                style={{
                  width: 256,
                  height: 128,
                }}
                contentFit="contain"
                cachePolicy="memory-disk"
                transition={300}
              />
            </View>
          )}
        </Animated.View>
        <View className="justify-center">
          <View className="items-center">
            <Text className="text-2xl font-medium text-foreground text-center">
              Analyzing your idea...
            </Text>
            <Text className="text-base text-muted-foreground mt-2 text-center max-w-[280]">
              I'm thinking about what additional details we'll need to make your perfect app
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSecondStep = useMemo(
    () => (
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
            <View className="space-y-8">
              <View>
                <Text className="text-base text-muted-foreground mb-6">
                  These questions are optional and help personalize your app generation
                </Text>
                {formData.questions.map((q) => (
                  <View key={q.id} className="mb-4">
                    <Text className="text-lg mb-2">{q.question}</Text>
                    <Input
                      value={q.answer}
                      onChangeText={(text) => handleQuestionAnswer(q.id, text)}
                      className="bg-transparent text-lg py-3"
                      placeholder="Your answer"
                      multiline
                      bottomSheet
                    />
                  </View>
                ))}
              </View>

              <View className="space-y-4">
                <Text className="text-lg font-medium">Reference Images</Text>
                <Text className="text-base text-muted-foreground">
                  Add images to help describe your app's style
                </Text>

                <ImageStack
                  images={formData.imagesDescription}
                  onReorder={(newImages) =>
                    setFormData((prev) => ({ ...prev, imagesDescription: newImages }))
                  }
                />

                <Button onPress={pickMultipleImages} variant="outline" className="w-full h-12">
                  <Upload size={20} className="mr-2 text-foreground" />
                  <Text>Add Images</Text>
                </Button>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    ),
    [formData.questions, formData.imagesDescription],
  );

  const renderStep = useCallback(() => {
    if (isTransitioning) {
      return renderLoadingStep();
    }
    if (step === 0) {
      return renderFirstStep;
    }
    return renderSecondStep;
  }, [step, isTransitioning, renderFirstStep, renderSecondStep]);

  // Preload the wand image
  useEffect(() => {
    async function loadWandImage() {
      try {
        const asset = Asset.fromModule(require('~/assets/images/icon-wand.png'));
        await asset.downloadAsync();
        setIsImageLoaded(true);
      } catch (error) {
        console.error('Failed to preload wand image:', error);
      }
    }
    loadWandImage();
  }, []);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{
        backgroundColor: colorScheme === 'dark' ? 'hsl(240 10% 3.9%)' : 'hsl(0 0% 100%)',
      }}
      handleIndicatorStyle={{
        backgroundColor: colorScheme === 'dark' ? 'hsl(240 5% 64.9%)' : 'hsl(240 3.8% 46.1%)',
        width: 40,
        height: 4,
        marginTop: 10,
      }}>
      <BottomSheetView style={{ flex: 1 }} className="pt-6">
        <View className="flex-1 px-6">
          <View className="h-14 mb-8 flex-row justify-between items-center">
            <Text className="text-4xl font-bold text-foreground">
              {step === 0 ? 'Create a New App' : 'Personalize Your App'}
            </Text>
            <View className="w-[76px]">
              {!hasGenerated && (
                <Button variant="ghost" onPress={handleReset}>
                  <Reset size={24} className="text-destructive" />
                </Button>
              )}
            </View>
          </View>

          <View className="flex-1 flex">
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="flex-1"
              keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
              {renderStep()}
            </KeyboardAvoidingView>
          </View>

          {!isTransitioning && (
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
                  <Button
                    onPress={handleBack}
                    className="rounded-full mr-2 h-10 w-12"
                    variant="ghost">
                    <ChevronLeft size={24} className="text-primary" />
                  </Button>
                )}
                <Button
                  className={`flex-1 rounded-full ${canContinue() ? 'bg-primary' : 'bg-muted'}`}
                  size="lg"
                  onPress={step === 0 ? handleNext : handleSubmit}
                  disabled={!canContinue() || isLoading}>
                  <Text
                    className={`text-center font-semibold ${
                      canContinue() ? 'text-primary-foreground' : 'text-muted-foreground'
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
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
