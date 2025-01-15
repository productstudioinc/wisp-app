import { Link } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { Text, View, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CreateProjectSheet } from '~/components/CreateProjectSheet';
import { supabase } from '~/supabase/client';
import { Sparkles } from '~/lib/icons/Sparkles';
import { Plus } from '~/lib/icons/Plus';
import { Button } from '~/components/ui/button';

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
}

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
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

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to project details
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 100)} layout={Layout}>
      <Pressable
        onPress={handlePress}
        className="bg-card rounded-2xl p-4 mb-3 border border-border">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground mb-1" numberOfLines={1}>
              {project.name}
            </Text>

            {project.prompt && (
              <Text className="text-sm text-muted-foreground mb-3" numberOfLines={2}>
                {project.prompt}
              </Text>
            )}

            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(project.status)}`} />
              <Text className="text-xs capitalize text-muted-foreground">
                {project.status}
                {project.status_message && ` • ${project.status_message}`}
              </Text>
            </View>
          </View>

          {project.created_at && (
            <Text className="text-xs text-muted-foreground ml-4">
              {new Date(project.created_at).toLocaleDateString()}
            </Text>
          )}
        </View>

        {project.error && (
          <Text className="text-xs text-red-500 mt-3" numberOfLines={2}>
            {project.error}
          </Text>
        )}

        {project.custom_domain && (
          <Text className="text-xs text-muted-foreground mt-3">{project.custom_domain}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

const EmptyState = () => (
  <View className="flex-1 items-center justify-center py-12">
    <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
    <Text className="text-lg font-semibold text-foreground mb-2">No apps yet</Text>
    <Text className="text-sm text-muted-foreground text-center px-6">
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
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 px-4">
        <View className="py-4">
          <Text className="text-2xl font-semibold text-foreground">My Apps</Text>
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
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg">
        <Plus className="text-primary-foreground" />
      </Button>
      <CreateProjectSheet onPresentRef={handlePresentRef} />
    </SafeAreaView>
  );
}
