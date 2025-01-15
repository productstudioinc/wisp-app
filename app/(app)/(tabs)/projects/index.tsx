import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreateProjectSheet } from '~/components/CreateProjectSheet';
import { supabase } from '~/supabase/client';

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

export default function HomeScreen() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from('projects').select('*');

      console.log(data);

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
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to projects changes');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to projects changes');
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-12">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-4xl font-bold text-foreground">Apps</Text>
          <CreateProjectSheet />
        </View>

        {projects.map((project) => (
          <View key={project.id} className="bg-card rounded-lg p-4 mb-4 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-2">{project.name}</Text>

            {project.prompt && (
              <Text className="text-sm text-muted-foreground mb-2">{project.prompt}</Text>
            )}

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View
                  className={`w-2 h-2 rounded-full mr-2 ${
                    project.status === 'deployed'
                      ? 'bg-green-500'
                      : project.status === 'creating'
                        ? 'bg-yellow-500'
                        : project.status === 'deploying'
                          ? 'bg-blue-500'
                          : 'bg-red-500'
                  }`}
                />
                <Text className="text-sm text-muted-foreground">
                  {project.status}
                  {project.status_message && ` - ${project.status_message}`}
                </Text>
              </View>

              <Text className="text-xs text-muted-foreground">
                {project.created_at && new Date(project.created_at).toLocaleDateString()}
              </Text>
            </View>

            {project.custom_domain && (
              <Text className="text-xs text-muted-foreground mt-2">{project.custom_domain}</Text>
            )}

            {project.error && <Text className="text-xs text-red-500 mt-2">{project.error}</Text>}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
