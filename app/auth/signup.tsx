import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signUp } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email.trim(), password, fullName.trim());
      
      if (error) {
        console.error('Signup error:', error);
        let errorMessage = 'An error occurred during signup';
        
        if (error.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        Alert.alert('Sign Up Error', errorMessage);
      } else {
        // Redirect to OTP verification screen
        router.push({
          pathname: '/auth/otp-verification',
          params: { email }
        });
      }
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.header}>
          <IconSymbol name="person.badge.plus" size={64} color={colors.tint} />
          <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
          <ThemedText style={styles.subtitle}>Start tracking your expenses today</ThemedText>
        </ThemedView>

        <View style={styles.form}>
          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }
              ]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor={colors.tabIconDefault}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.tabIconDefault}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Password <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password (min 6 characters)"
                placeholderTextColor={colors.tabIconDefault}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <IconSymbol
                  name={showPassword ? 'eye.slash' : 'eye'}
                  size={20}
                  color={colors.tabIconDefault}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Confirm Password <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor={colors.tabIconDefault}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: colorScheme === 'dark' ? colors.background : 'white' }]}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.linkContainer}>
            <Text style={[styles.linkText, { color: colors.text }]}>
              Already have an account?{' '}
              <Link href="/auth/login" style={[styles.link, { color: colors.tint }]}>
                Sign In
              </Link>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 56,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 18,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 56,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
  },
  link: {
    fontWeight: '600',
  },
});
