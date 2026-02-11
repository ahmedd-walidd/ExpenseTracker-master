import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/types/expense';

export class ProfileService {
  // Fetch user profile
  static async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return data;
  }

  // Create a new profile
  static async createProfile(profile: {
    id: string;
    email: string;
    full_name?: string | null;
    currency?: string;
  }): Promise<Profile> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name || null,
        currency: profile.currency || 'EGP',
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    return data;
  }

  // Update profile
  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data;
  }

  // Update only currency
  static async updateCurrency(userId: string, currency: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        currency,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update currency: ${error.message}`);
    }

    return data;
  }

  // Create or update profile (upsert)
  static async upsertProfile(profile: {
    id: string;
    email: string;
    full_name?: string | null;
    currency?: string;
  }): Promise<Profile> {
    const now = new Date().toISOString();
    
    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', profile.id)
      .single();

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name || null,
        currency: profile.currency || 'EGP',
        created_at: existingProfile ? undefined : now, // Only set created_at if it's a new profile
        updated_at: now,
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to upsert profile: ${error.message}`);
    }

    return data;
  }
}
