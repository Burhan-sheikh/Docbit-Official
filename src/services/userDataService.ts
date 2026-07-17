import { supabase } from '../supabase/client';
import type { ConversionHistory, Favorite, RecentTool } from '../supabase/database.types';

export async function recordConversion(
  entry: Database['public']['Tables']['conversion_history']['Insert']
): Promise<void> {
  const { error } = await supabase.from('conversion_history').insert(entry);
  if (error) console.error('Failed to record conversion:', error.message);
}

export async function getConversionHistory(limit = 50): Promise<ConversionHistory[]> {
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
  const { error: upsertError } = await supabase
    .from('recent_tools')
    .upsert({ tool_id: toolId, used_at: new Date().toISOString() }, { onConflict: 'user_id,tool_id' });
  if (upsertError) console.error('Failed to record tool usage:', upsertError.message);
}

export async function getUsageStats(): Promise<{ total: number; successCount: number; failCount: number }> {
  const { count, error } = await supabase
    .from('conversion_history')
    .select('*', { count: 'exact', head: true });
  if (error) {
    console.error('Failed to fetch usage stats:', error.message);
    return { total: 0, successCount: 0, failCount: 0 };
  }
  return { total: count || 0, successCount: 0, failCount: 0 };
}

import type { Database } from '../supabase/database.types';
