export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          plan: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: string;
        };
      };
      conversion_history: {
        Row: {
          id: string;
          user_id: string;
          tool_id: string;
          tool_name: string | null;
          filename: string | null;
          output_type: string | null;
          file_size: number | null;
          duration_ms: number | null;
          success: boolean;
          error_message: string | null;
          device: string | null;
          browser: string | null;
          processing_method: string | null;
          created_at: string;
        };
        Insert: {
          user_id?: string;
          tool_id: string;
          tool_name?: string | null;
          filename?: string | null;
          output_type?: string | null;
          file_size?: number | null;
          duration_ms?: number | null;
          success?: boolean;
          error_message?: string | null;
          device?: string | null;
          browser?: string | null;
          processing_method?: string | null;
        };
        Update: Partial<Database['public']['Tables']['conversion_history']['Insert']>;
      };
      favorites: {
        Row: { id: string; user_id: string; tool_id: string; created_at: string };
        Insert: { user_id?: string; tool_id: string };
        Update: { tool_id?: string };
      };
      recent_tools: {
        Row: { id: string; user_id: string; tool_id: string; used_at: string };
        Insert: { user_id?: string; tool_id: string };
        Update: { tool_id?: string };
      };
      settings: {
        Row: {
          user_id: string;
          theme: string;
          email_notifications: boolean;
          privacy_consent: boolean;
          preferences: Record<string, unknown>;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          theme?: string;
          email_notifications?: boolean;
          privacy_consent?: boolean;
          preferences?: Record<string, unknown>;
        };
        Update: Partial<Database['public']['Tables']['settings']['Insert']>;
      };
      analytics: {
        Row: {
          id: string;
          user_id: string;
          event: string;
          tool_id: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          user_id?: string;
          event: string;
          tool_id?: string | null;
          metadata?: Record<string, unknown>;
        };
        Update: Partial<Database['public']['Tables']['analytics']['Insert']>;
      };
      feedback: {
        Row: { id: string; user_id: string; message: string; rating: number | null; created_at: string };
        Insert: { user_id?: string; message: string; rating?: number | null };
        Update: { message?: string; rating?: number | null };
      };
      reports: {
        Row: { id: string; user_id: string; type: string; target: string | null; message: string; status: string; created_at: string };
        Insert: { user_id?: string; type: string; target?: string | null; message: string; status?: string };
        Update: Partial<Database['public']['Tables']['reports']['Insert']>;
      };
      feature_requests: {
        Row: { id: string; user_id: string; title: string; description: string | null; status: string; upvotes: number; created_at: string };
        Insert: { user_id?: string; title: string; description?: string | null; status?: string; upvotes?: number };
        Update: Partial<Database['public']['Tables']['feature_requests']['Insert']>;
      };
      saved_files_metadata: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          tool_id: string | null;
          output_type: string | null;
          file_size: number | null;
          storage_path: string | null;
          is_cloud: boolean;
          created_at: string;
        };
        Insert: {
          user_id?: string;
          filename: string;
          tool_id?: string | null;
          output_type?: string | null;
          file_size?: number | null;
          storage_path?: string | null;
          is_cloud?: boolean;
        };
        Update: Partial<Database['public']['Tables']['saved_files_metadata']['Insert']>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: string;
          status: string;
          provider: string | null;
          provider_customer_id: string | null;
          provider_subscription_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string;
          plan?: string;
          status?: string;
          provider?: string | null;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ConversionHistory = Database['public']['Tables']['conversion_history']['Row'];
export type Favorite = Database['public']['Tables']['favorites']['Row'];
export type RecentTool = Database['public']['Tables']['recent_tools']['Row'];
export type Settings = Database['public']['Tables']['settings']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
