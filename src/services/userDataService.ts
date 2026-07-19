import { supabase, isSupabaseConfigured } from '../supabase/client';
import type {
  Database,
  ConversionHistory,
  Favorite,
  RecentTool,
} from '../supabase/database.types';

type ConversionInsert = Database['public']['Tables']['conversion_history']['Insert'];

export async function recordConversion(entry: ConversionInsert): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('conversion_history').insert(entry);
  if (error) console.error('Failed to record conversion:', error.message);
}

export async function getConversionHistory(limit = 50): Promise<ConversionHistory[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('conversion_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Failed to fetch history:', error.message);
    return [];
  }
  return data || [];
}

export async function getFavorites(): Promise<Favorite[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Failed to fetch favorites:', error.message);
    return [];
  }
  return data || [];
}

export async function toggleFavorite(toolId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('tool_id', toolId)
    .maybeSingle();

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id);
    return false;
  }
  await supabase.from('favorites').insert({ tool_id: toolId });
  return true;
}

export async function getRecentTools(limit = 10): Promise<RecentTool[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('recent_tools')
    .select('*')
    .order('used_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Failed to fetch recent tools:', error.message);
    return [];
  }
  return data || [];
}

export async function recordToolUsage(toolId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error: upsertError } = await supabase
    .from('recent_tools')
    .upsert({ tool_id: toolId, used_at: new Date().toISOString() }, { onConflict: 'user_id,tool_id' });
  if (upsertError) console.error('Failed to record tool usage:', upsertError.message);
}

export async function getUsageStats(): Promise<{ total: number; successCount: number; failCount: number }> {
  if (!isSupabaseConfigured) return { total: 0, successCount: 0, failCount: 0 };
  const { data, error } = await supabase
    .from('conversion_history')
    .select('success')
    .order('created_at', { ascending: false })
    .limit(1000);
  if (error) {
    console.error('Failed to fetch usage stats:', error.message);
    return { total: 0, successCount: 0, failCount: 0 };
  }
  const rows = data || [];
  const successCount = rows.filter((r) => r.success).length;
  return {
    total: rows.length,
    successCount,
    failCount: rows.length - successCount,
  };
}

export async function getProfile() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .maybeSingle();
  if (error) {
    console.error('Failed to fetch profile:', error.message);
    return null;
  }
  return data;
}

export async function updateProfile(updates: { full_name?: string; avatar_url?: string }) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', (await supabase.auth.getUser()).data.user?.id || '')
    .select()
    .maybeSingle();
  if (error) console.error('Failed to update profile:', error.message);
  return data;
}

export async function getSubscription() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .maybeSingle();
  if (error) {
    console.error('Failed to fetch subscription:', error.message);
    return null;
  }
  return data;
}

export async function getSettings() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .maybeSingle();
  if (error) {
    console.error('Failed to fetch settings:', error.message);
    return null;
  }
  return data;
}

export async function updateSettings(updates: { theme?: string; email_notifications?: boolean; privacy_consent?: boolean; preferences?: Record<string, unknown> }) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('settings')
    .update(updates)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
    .select()
    .maybeSingle();
  if (error) console.error('Failed to update settings:', error.message);
  return data;
}

export async function deleteAccount(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error: signOutError } = await supabase.auth.signOut();
  return !signOutError;
}
