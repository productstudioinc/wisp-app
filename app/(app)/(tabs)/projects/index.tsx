import React, { useEffect, useState, useCallback } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInUp,
  Layout,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CreateProjectSheet } from '~/components/CreateProjectSheet';
import { supabase } from '~/supabase/client';
import { Sparkles } from '~/lib/icons/Sparkles';
import { Plus } from '~/lib/icons/Plus';
import { Button } from '~/components/ui/button';
import { Background } from '~/components/ui/background';
import { formatDistanceToNow } from 'date-fns';
import { Share2 } from '~/lib/icons/Share2';
import { ExternalLink } from '~/lib/icons/ExternalLink';
import { shareUrl, openUrl } from '~/lib/utils';
import { useRouter } from 'expo-router';

type ProjectStatus = 'creating' | 'deployed' | 'failed' | 'deploying';

interface Project {
  id: string;
  name: string;
  display_name: string;
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

  const pulseAnim = useSharedValue(0);

  useEffect(() => {
    if (project.status === 'creating') {
      pulseAnim.value = withRepeat(
        withSequence(withTiming(1, { duration: 1000 }), withTiming(0, { duration: 1000 })),
        -1, // Infinite repetition
        true, // Reverse animation
      );
    } else {
      pulseAnim.value = 0;
    }
  }, [project.status]);

  const dotAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(pulseAnim.value, [0, 1], [0.4, 1]);

    return {
      opacity,
    };
  });

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
                {project.display_name}
              </Text>
              <Animated.View
                className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}
                style={project.status === 'creating' ? dotAnimatedStyle : undefined}
              />
            </View>

            {project.created_at && (
              <Text className="text-sm text-muted-foreground mb-2">
                {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
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
    <Sparkles className="w-16 h-16 text-muted-foreground mb-6" />
    <Text className="text-2xl font-semibold text-foreground mb-3">No apps yet</Text>
    <Text className="text-lg text-muted-foreground text-center px-6">
      Create your first app to get started.{'\n'}It only takes a few seconds!
    </Text>
  </View>
);

export default function HomeScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [presentCreateProject, setPresentCreateProject] = useState<(() => void) | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from('projects').select('*');

      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }

      setProjects(data || []);
    };

    fetchProjects();

    const channel = supabase
      .channel('projects-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          console.log('Change received:', payload);

          switch (payload.eventType) {
            case 'INSERT':
              setProjects((current) => [...current, payload.new as Project]);
              break;
            case 'UPDATE':
              setProjects((current) =>
                current.map((project) =>
                  project.id === payload.new.id ? (payload.new as Project) : project,
                ),
              );
              break;
            case 'DELETE':
              setProjects((current) => current.filter((project) => project.id !== payload.old.id));
              break;
          }
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handlePresentRef = useCallback((present: () => void) => {
    setPresentCreateProject(() => present);
  }, []);

  return (
    <Background>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-1 px-6">
          <View className="py-6">
            <Text className="text-4xl font-title text-foreground">My Apps</Text>
          </View>

          {projects.length > 0 ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 0,
              }}>
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

        <Button
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            presentCreateProject?.();
          }}
          size="icon"
          className="absolute bottom-8 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-lg">
          <Plus className="text-primary-foreground w-8 h-8" />
        </Button>
        <CreateProjectSheet onPresentRef={handlePresentRef} />
      </SafeAreaView>
    </Background>
  );
}
