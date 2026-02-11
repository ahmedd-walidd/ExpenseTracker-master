import { supabase } from '@/lib/supabase/client';
import { ProfileService } from '@/services/ProfileService';
import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<{ data?: any; error?: any }>;
  resendOtp: (email: string) => Promise<{ data?: any; error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: undefined, // Disable email confirmation, use OTP instead
        },
      });

      if (error) {
        console.error('Signup error:', error);
        return { error };
      }

      if (!data.user) {
        return { error: new Error('No user data returned from signup') };
      }

      // Don't create profile yet - wait for OTP verification
      // Profile will be created after successful OTP verification

      return { error: null };
    } catch (err) {
      console.error('Unexpected signup error:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });

      if (error) {
        console.error('OTP verification error:', error);
        return { error };
      }

      // Create profile after successful OTP verification
      if (data.user) {
        try {
          await ProfileService.createProfile({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || null,
            currency: 'EGP',
          });
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
          // Don't fail verification if profile creation fails
        }
      }

      return { data, error: null };
    } catch (err) {
      console.error('Unexpected OTP verification error:', err);
      return { error: err };
    }
  };

  const resendOtp = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        console.error('Resend OTP error:', error);
        return { error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Unexpected resend OTP error:', err);
      return { error: err };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    verifyOtp,
    resendOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
