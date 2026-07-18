/**
 * API Keys Service — placeholder architecture for programmatic access.
 * API keys are hashed and stored in an `api_keys` table (future migration).
 * This module exposes the interface the dashboard will call when API access ships.
 */
import { supabase } from '../supabase/client';

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export async function listApiKeys(_userId: string): Promise<ApiKey[]> {
  return [];
}

export async function createApiKey(_userId: string, _name: string): Promise<{ key: string; record: ApiKey } | null> {
  throw new Error('API key generation not yet enabled');
}

export async function revokeApiKey(_userId: string, _keyId: string): Promise<void> {
  throw new Error('API key revocation not yet enabled');
}

export async function validateApiKey(_key: string): Promise<string | null> {
  return null;
}
