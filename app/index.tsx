import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function RootIndex() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect to appropriate screen based on authentication state
  if (user) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/auth/login" />;
  }
}
