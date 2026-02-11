import { useAuth } from '@/contexts/AuthContext';
import { ProfileService } from '@/services/ProfileService';
import { Profile } from '@/types/expense';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query keys for caching
export const profileKeys = {
  all: ['profiles'] as const,
  profile: (userId: string) => [...profileKeys.all, userId] as const,
};

// Hook to fetch user profile
export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: profileKeys.profile(user?.id || ''),
    queryFn: () => ProfileService.getProfile(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if profile doesn't exist
      if (error.message.includes('PGRST116')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook to create profile
export function useCreateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ProfileService.createProfile,
    onSuccess: (data) => {
      // Update the profile cache
      if (user?.id) {
        queryClient.setQueryData(profileKeys.profile(user.id), data);
      }
    },
    onError: (error) => {
      console.error('Failed to create profile:', error);
    },
  });
}

// Hook to update profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ updates }: { updates: Partial<Profile> }) => 
      ProfileService.updateProfile(user!.id, updates),
    onSuccess: (data) => {
      // Update the profile cache
      if (user?.id) {
        queryClient.setQueryData(profileKeys.profile(user.id), data);
      }
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    },
  });
}

// Hook specifically for updating currency
export function useUpdateCurrency() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ currency }: { currency: string }) => 
      ProfileService.updateCurrency(user!.id, currency),
    onSuccess: (data) => {
      // Update the profile cache
      if (user?.id) {
        queryClient.setQueryData(profileKeys.profile(user.id), data);
      }
    },
    onError: (error) => {
      console.error('Failed to update currency:', error);
    },
  });
}

// Hook to create or update profile (upsert)
export function useUpsertProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ProfileService.upsertProfile,
    onSuccess: (data) => {
      // Update the profile cache
      if (user?.id) {
        queryClient.setQueryData(profileKeys.profile(user.id), data);
      }
    },
    onError: (error) => {
      console.error('Failed to upsert profile:', error);
    },
  });
}
