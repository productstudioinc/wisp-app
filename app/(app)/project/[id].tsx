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
  mobile_screenshot: string | null;
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

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="px-6 pt-4">
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <ChevronLeft size={24} className="text-foreground" />
            </TouchableOpacity>
          </View>

          <View className="px-6 mb-8">
            <View className="flex-row items-start">
              <View className="w-28 h-28 rounded-[22px] bg-muted overflow-hidden shadow-lg">
                {faviconUrl ? (
                  <Image
                    source={{ uri: faviconUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full bg-secondary items-center justify-center">
                    <Text className="text-3xl font-semibold text-muted-foreground">
                      {project.name.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-1 ml-5 pt-1">
                <Text className="text-2xl font-title text-foreground mb-1" numberOfLines={2}>
                  {project.name}
                </Text>
                <View className="flex-row items-center">
                  <View
                    className={`w-2.5 h-2.5 rounded-full ${getStatusColor(project.status)} mr-2`}
                  />
                  <Text className="text-base text-muted-foreground capitalize">
                    {project.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {project.prompt && (
            <View className="px-6 mb-8">
              <Text className="text-lg font-medium text-foreground mb-3">About</Text>
              <Text className="text-base text-muted-foreground leading-relaxed">
                {project.prompt}
              </Text>
            </View>
          )}

          {project.mobile_screenshot && (
            <View className="mb-8">
              <Text className="text-lg font-medium text-foreground mb-3 px-6">Preview</Text>
              <View className="px-6">
                <View className="w-[260px] aspect-[9/16] bg-muted rounded-3xl overflow-hidden shadow-xl mx-auto">
                  <Image
                    source={{ uri: project.mobile_screenshot }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              </View>
            </View>
          )}

          <View className="px-6">
            <Text className="text-lg font-medium text-foreground mb-3">Information</Text>
            <View className="space-y-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-base text-muted-foreground">Created</Text>
                <Text className="text-base text-foreground">
                  {formatDistanceToNow(new Date(project.created_at!), { addSuffix: true })}
                </Text>
              </View>

              {project.deployed_at && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-muted-foreground">Last Updated</Text>
                  <Text className="text-base text-foreground">
                    {formatDistanceToNow(new Date(project.deployed_at), { addSuffix: true })}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <SafeAreaView edges={['bottom']} className="px-6 pb-2">
          <View className="flex-row w-full bg-background/80 backdrop-blur-lg">
            <Button
              className="flex-1 flex-row items-center justify-center rounded-full h-12"
              onPress={handleOpen}
              disabled={!project.custom_domain}>
              <ExternalLink size={20} className="text-primary-foreground" />
              <Text className="text-base font-medium text-primary-foreground ml-2">Open</Text>
            </Button>

            <Button
              className="w-12 h-12 flex-row items-center justify-center ml-4 rounded-full"
              onPress={handleShare}
              disabled={!project.custom_domain}
              variant="secondary">
              <Share2 size={20} className="text-foreground" />
            </Button>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </Background>
  );
}
