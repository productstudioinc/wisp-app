import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Background } from '~/components/ui/background';
import { supabase } from '~/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import Animated, { FadeInUp, Layout, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

type ProjectStatus = 'creating' | 'deployed' | 'failed' | 'deploying';

interface Project {
  id: string;
  name: string;
  user_id: string;
  project_id: string;
  dns_record_id: string | null;
  custom_domain: string | null;
  prompt: string | null;
  status: ProjectStatus;
  created_at: string | null;
  status_message: string | null;
  last_updated: string | null;
  error: string | null;
  deployed_at: string | null;
  private: boolean;
  icon: string | null;
}

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'deployed':
        return 'bg-green-500';
      case 'creating':
        return 'bg-yellow-500';
      case 'deploying':
        return 'bg-blue-500';
      default:
        return 'bg-red-500';
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(isPressed ? 0.95 : 1, {
            damping: 15,
            stiffness: 300,
          }),
        },
      ],
    };
  });

  const handlePress = () => {
    setIsPressed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      setIsPressed(false);
      router.push(`/project/${project.id}`);
    }, 100);
  };

  const faviconUrl = project.custom_domain ? `https://${project.custom_domain}/favicon.png` : null;

  return (
    <Animated.View entering={FadeInUp.delay(index * 100)} layout={Layout} style={animatedStyle}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={1}
        className="bg-card/80 backdrop-blur-md rounded-2xl py-4 px-5 mb-3 border border-border">
        <View className="flex-row items-start">
          <View className="w-12 h-12 rounded-xl bg-muted mr-4 overflow-hidden">
            {faviconUrl ? (
              <>
                <Image source={{ uri: faviconUrl }} className="w-full h-full" />
              </>
            ) : (
              <View className="w-full h-full bg-secondary items-center justify-center">
                <Text className="text-lg font-semibold text-muted-foreground">
                  {project.name.charAt(0)}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-xl font-semibold text-foreground mr-2" numberOfLines={1}>
                {project.name}
              </Text>
              <View className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
            </View>

            {project.created_at && (
              <Text className="text-sm text-muted-foreground mb-2">
                {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
              </Text>
            )}

            {project.prompt && (
              <Text className="text-sm text-muted-foreground" numberOfLines={3}>
                {project.prompt}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const EmptyState = () => (
  <View className="flex-1 items-center justify-center py-12">
    <Text className="text-2xl font-semibold text-foreground mb-3">No public apps yet</Text>
    <Text className="text-lg text-muted-foreground text-center px-6">
      Check back later for inspiration from the community
    </Text>
  </View>
);

export default function DiscoverScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('private', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return;
    }

    setProjects(data || []);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <Background>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-1 px-6">
          <View className="py-6">
            <Text className="text-4xl font-title mb-3 text-foreground">Discover</Text>
            <Text className="text-xl text-muted-foreground">
              Find inspiration for your next project
            </Text>
          </View>

          {projects.length > 0 ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 0,
              }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
              <View>
                {projects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </View>
            </ScrollView>
          ) : (
            <EmptyState />
          )}
        </View>
      </SafeAreaView>
    </Background>
  );
}
