import { View, Text, Image, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDistanceToNow } from 'date-fns';
import { Share2 } from '~/lib/icons/Share2';
import { ExternalLink } from '~/lib/icons/ExternalLink';
import { TouchableOpacity } from 'react-native';
import { shareUrl, openUrl } from '~/lib/utils';
import { supabase } from '~/supabase/client';
import { useEffect, useState } from 'react';
import { Background } from '~/components/ui/background';
import { ChevronLeft } from '~/lib/icons/ChevronLeft';
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
  icon: string | null;
}

export default function ProjectDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();

      if (!error && data) {
        setProject(data);
      }
    };

    fetchProject();
  }, [id]);

  const handleShare = () =>
    project?.custom_domain && shareUrl(project.custom_domain, `Share ${project.name}`);
  const handleOpen = () => project?.custom_domain && openUrl(project.custom_domain);

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

  if (!project) return null;

  const faviconUrl = project.custom_domain ? `https://${project.custom_domain}/favicon.png` : null;

  return (
    <Background>
      <SafeAreaView className="flex-1" edges={['top']}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="px-6 py-4">
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <ChevronLeft size={24} className="text-foreground" />
            </TouchableOpacity>

            <View className="flex-row items-center space-x-4 mb-8">
              <View className="w-24 h-24 rounded-2xl bg-muted overflow-hidden">
                {faviconUrl ? (
                  <Image
                    source={{ uri: faviconUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full bg-secondary items-center justify-center">
                    <Text className="text-2xl font-semibold text-muted-foreground">
                      {project.name.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-1 ml-5">
                <View className="flex-row items-center mb-1">
                  <Text className="text-2xl font-title text-foreground mr-2" numberOfLines={1}>
                    {project.name}
                  </Text>
                  <View className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`} />
                </View>
                <Text className="text-base text-muted-foreground">
                  {formatDistanceToNow(new Date(project.created_at!), { addSuffix: true })}
                </Text>
              </View>
            </View>

            <View className="flex-row mb-8 w-full">
              <Button
                className="flex-1 flex-row items-center justify-center"
                onPress={handleOpen}
                disabled={!project.custom_domain}>
                <ExternalLink size={20} className="text-primary-foreground" />
                <Text className="text-base font-medium text-primary-foreground ml-2">Open</Text>
              </Button>

              <Button
                className="w-14 flex-row items-center justify-center ml-4"
                onPress={handleShare}
                disabled={!project.custom_domain}
                variant="secondary">
                <Share2 size={20} className="text-foreground" />
              </Button>
            </View>

            {project.prompt && (
              <View className="mb-8">
                <Text className="text-lg font-medium text-foreground mb-2">About</Text>
                <Text className="text-base text-muted-foreground leading-relaxed">
                  {project.prompt}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}
