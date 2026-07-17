import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { recordConversion, recordToolUsage } from '../services/userDataService';

interface TrackParams {
  toolId: string;
  toolName: string;
  filename?: string;
  outputType?: string;
  fileSize?: number;
  durationMs?: number;
  success: boolean;
  errorMessage?: string;
  processingMethod?: string;
}

export function useConversionTracker() {
  const { session } = useAuth();

  return useCallback(
    (params: TrackParams) => {
      if (!session) return;

      const ua = navigator.userAgent;
      const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/)?.[0] || 'Unknown';
      const device = /Mobile|Android|iPhone|iPad/.test(ua) ? 'Mobile' : 'Desktop';

      recordConversion({
        tool_id: params.toolId,
        tool_name: params.toolName,
        filename: params.filename || null,
        output_type: params.outputType || null,
        file_size: params.fileSize ?? null,
        duration_ms: params.durationMs ?? null,
        success: params.success,
        error_message: params.errorMessage || null,
        device,
        browser,
        processing_method: params.processingMethod || 'local',
      });

      recordToolUsage(params.toolId);
    },
    [session]
  );
}
