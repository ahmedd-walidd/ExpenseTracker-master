import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function OtpVerificationScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOtp, resendOtp } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, canResend]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste operation
      const pastedCode = value.slice(0, 6);
      const newOtp = [...otp];
      for (let i = 0; i < pastedCode.length && i < 6; i++) {
        newOtp[i] = pastedCode[i];
      }
      setOtp(newOtp);
      
      // Focus the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
      
      // Auto-verify if all 6 digits are filled
      if (newOtp.every(digit => digit !== '')) {
        setTimeout(() => handleVerify(newOtp.join('')), 100);
      }
    } else {
      // Handle single digit input
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      
      // Auto-verify if all 6 digits are filled
      if (newOtp.every(digit => digit !== '')) {
        setTimeout(() => handleVerify(newOtp.join('')), 100);
      }
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (providedOtp?: string) => {
    const otpCode = providedOtp || otp.join('');
    
    if (otpCode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter all 6 digits',
        position: 'top',
        visibilityTime: 3000,
        text1Style: {
          fontSize: 18,
          fontWeight: '600',
        },
        text2Style: {
          fontSize: 16,
          fontWeight: '500',
        },
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await verifyOtp(email!, otpCode);
      
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: error.message,
          position: 'top',
          visibilityTime: 4000,
          text1Style: {
            fontSize: 18,
            fontWeight: '600',
          },
          text2Style: {
            fontSize: 16,
            fontWeight: '500',
          },
        });
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Your account has been verified successfully.',
          position: 'top',
          visibilityTime: 3000,
          text1Style: {
            fontSize: 18,
            fontWeight: '600',
          },
          text2Style: {
            fontSize: 16,
            fontWeight: '500',
          },
        });
        setTimeout(() => router.replace('/auth/login'), 2000);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'An unexpected error occurred. Please try again.',
        position: 'top',
        visibilityTime: 4000,
        text1Style: {
          fontSize: 18,
          fontWeight: '600',
        },
        text2Style: {
          fontSize: 16,
          fontWeight: '500',
        },
      });
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const { error } = await resendOtp(email!);
      
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message,
          position: 'top',
          visibilityTime: 4000,
          text1Style: {
            fontSize: 18,
            fontWeight: '600',
          },
          text2Style: {
            fontSize: 16,
            fontWeight: '500',
          },
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'A new verification code has been sent to your email.',
          position: 'top',
          visibilityTime: 3000,
          text1Style: {
            fontSize: 18,
            fontWeight: '600',
          },
          text2Style: {
            fontSize: 16,
            fontWeight: '500',
          },
        });
        setCountdown(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to resend code. Please try again.',
        position: 'top',
        visibilityTime: 4000,
        text1Style: {
          fontSize: 18,
          fontWeight: '600',
        },
        text2Style: {
          fontSize: 16,
          fontWeight: '500',
        },
      });
      console.error('Resend OTP error:', error);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <ThemedView style={styles.header}>
        <IconSymbol name="envelope.badge" size={64} color={colors.tint} />
        <ThemedText type="title" style={styles.title}>Verify Your Email</ThemedText>
        <ThemedText style={styles.subtitle}>
          We've sent a 6-digit verification code to{'\n'}
          <Text style={{ fontWeight: '600' }}>{email}</Text>
        </ThemedText>
      </ThemedView>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[
              styles.otpInput,
              { 
                backgroundColor: colors.card, 
                color: colors.text, 
                borderColor: digit ? colors.tint : colors.border 
              }
            ]}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            textAlign="center"
          />
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          { 
            backgroundColor: otp.join('').length === 6 ? colors.tint : colors.tabIconDefault,
            opacity: otp.join('').length === 6 ? 1 : 0.6 
          }
        ]}
        onPress={() => handleVerify()}
        disabled={loading || otp.join('').length !== 6}
      >
        <Text style={[styles.buttonText, { 
          color: otp.join('').length === 6 ? 'white' : colors.text 
        }]}>
          {loading ? 'Verifying...' : 'Verify Code'}
        </Text>
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        <Text style={[styles.resendText, { color: colors.text }]}>
          Didn't receive the code?
        </Text>
        
        {canResend ? (
          <TouchableOpacity
            onPress={handleResend}
            disabled={resendLoading}
            style={styles.resendButton}
          >
            <Text style={[styles.resendButtonText, { color: colors.tint }]}>
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.countdownText, { color: colors.tabIconDefault }]}>
            Resend in {countdown}s
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={[styles.backButtonText, { color: colors.tint }]}>
          ← Back to Sign Up
        </Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 56,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  resendText: {
    fontSize: 16,
    marginBottom: 8,
  },
  resendButton: {
    padding: 8,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  countdownText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  backButton: {
    alignItems: 'center',
    padding: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
