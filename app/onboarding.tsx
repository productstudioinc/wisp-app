import { Pagination } from "@/components/pagination";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
type OnboardingStep = {
  type: "website-purpose" | "website-type";
  component: React.ComponentType;
};

const WebsitePurposeStep = () => {
  const options = [
    {
      label: "For myself, my business or a friend",
      subtext: "Personal or small business website",
    },
    {
      label: "For a client, as a freelancer or an agency",
      subtext: "Professional web development",
    },
  ];

  return (
    <View className="flex-1 px-6">
      <Text className="text-4xl font-bold mb-2">
        Who are you creating a website for?
      </Text>
      <Text className="text-lg text-gray-600 mb-8">Let's get started!</Text>

      <View className="gap-4">
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center p-4 rounded-xl bg-gray-100"
          >
            <View className="h-6 w-6 rounded-full border-2 border-gray-300 mr-4" />
            <View>
              <Text className="text-lg font-semibold">{option.label}</Text>
              <Text className="text-gray-600">{option.subtext}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const WebsiteTypeStep = () => {
  const [searchText, setSearchText] = useState("");

  const examples = [
    "Online Store",
    "Portfolio",
    "Blog",
    "Consultant",
    "Technology Company",
    "Restaurant",
    "Event",
  ];

  return (
    <View className="flex-1 px-6">
      <Text className="text-4xl font-bold mb-2">
        What type of website do you want to create?
      </Text>

      <View className="mb-8">
        <TextInput
          className="p-4 bg-gray-100 rounded-xl text-lg"
          placeholder="Search for your business or site type"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <Text className="text-sm text-gray-500 mb-4">EXAMPLES</Text>
      <View className="gap-4">
        {examples.map((example, index) => (
          <TouchableOpacity
            key={index}
            className="p-4 border-b border-gray-200"
          >
            <Text className="text-lg">{example}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const onboardingSteps: OnboardingStep[] = [
  {
    type: "website-purpose",
    component: WebsitePurposeStep,
  },
  {
    type: "website-type",
    component: WebsiteTypeStep,
  },
];

export default function WelcomeScreen() {
  const progress = useSharedValue<number>(0);
  const router = useRouter();
  const CAROUSEL_WIDTH = width - 32;
  const carouselRef = useRef<ICarouselInstance>(null);

  const renderItem = ({ item }: { item: OnboardingStep }) => {
    const StepComponent = item.component;
    return <StepComponent />;
  };

  const handleContinue = async () => {
    try {
      await AsyncStorage.setItem("onboarding_complete", "true");
      router.push("/subscribe");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  const onPressPagination = (index: number) => {
    console.log(index, progress);
    carouselRef.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  console.log(Math.floor(width / onboardingSteps.length));

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="items-center mt-4 pb-12">
        <Pagination
          progress={progress}
          data={onboardingSteps}
          dotStyle={{
            width: Math.floor(width / onboardingSteps.length) - 10,
            height: 4,
            backgroundColor: "#D1D5DB",
          }}
          activeDotStyle={{
            width: Math.floor(width / onboardingSteps.length) - 10,
            height: 4,
            backgroundColor: "#007AFF",
          }}
          containerStyle={{
            gap: 10,
          }}
          horizontal
          onPress={onPressPagination}
        />
      </View>
      <View className="flex-1">
        <Carousel
          ref={carouselRef}
          data={onboardingSteps}
          height={Dimensions.get("window").height}
          width={width}
          loop={false}
          pagingEnabled={true}
          snapEnabled={true}
          onProgressChange={(_, absoluteProgress) => {
            progress.value = absoluteProgress;
          }}
          renderItem={renderItem}
          defaultIndex={0}
        />
      </View>

      <View className="px-6 pb-8">
        <TouchableOpacity
          className="bg-black py-4 rounded-full"
          onPress={() => {
            if (progress.value < onboardingSteps.length - 1) {
              carouselRef.current?.scrollTo({
                count: 1,
                animated: true,
              });
            } else {
              handleContinue();
            }
          }}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {progress.value < onboardingSteps.length - 1 ? "Next" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
