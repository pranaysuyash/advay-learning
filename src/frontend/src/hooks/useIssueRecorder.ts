import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type IssueRecorderStatus =
  | 'idle'
  | 'preparing'
  | 'recording'
  | 'stopping'
  | 'error';

export interface UseIssueRecorderOptions {
  maxDurationMs?: number;
  mimeTypeCandidates?: string[];
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
}

export interface IssueRecorderStartOptions extends UseIssueRecorderOptions {
  onMaxDurationReached?: () => void;
}

export interface UseIssueRecorderResult {
  status: IssueRecorderStatus;
  error: string | null;
  elapsedMs: number;
  mimeType: string | null;
  isSupported: boolean;
  startRecording: (
    stream: MediaStream,
    options?: IssueRecorderStartOptions,
  ) => Promise<void>;
  stopRecording: () => Promise<Blob>;
  cancelRecording: () => void;
}

const DEFAULT_MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
  'video/mp4',
];

export function pickSupportedRecorderMimeType(
  candidates: string[] = DEFAULT_MIME_CANDIDATES,
): string | null {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return null;
  }

  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function useIssueRecorder(
  defaults: UseIssueRecorderOptions = {},
): UseIssueRecorderResult {
  const [status, setStatus] = useState<IssueRecorderStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [mimeType, setMimeType] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const elapsedIntervalRef = useRef<number | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);
  const resolveStopRef = useRef<((blob: Blob) => void) | null>(null);
  const rejectStopRef = useRef<((reason?: unknown) => void) | null>(null);

  const isSupported = useMemo(
    () => typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined',
    [],
  );

  const clearTimers = useCallback(() => {
    if (elapsedIntervalRef.current !== null) {
      window.clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
    if (stopTimeoutRef.current !== null) {
      window.clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
  }, []);

  const resetStopPromiseRefs = useCallback(() => {
    resolveStopRef.current = null;
    rejectStopRef.current = null;
  }, []);

  const cancelRecording = useCallback(() => {
    clearTimers();

    const recorder = recorderRef.current;
    recorderRef.current = null;
    chunksRef.current = [];
    startedAtRef.current = null;
    setElapsedMs(0);

    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        // Ignore stop errors during cancellation.
      }
    }

    resetStopPromiseRefs();
    setStatus('idle');
  }, [clearTimers, resetStopPromiseRefs]);

  const stopRecording = useCallback(async (): Promise<Blob> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      throw new Error('Recorder is not active');
    }

    setStatus('stopping');
    clearTimers();

    return new Promise<Blob>((resolve, reject) => {
      resolveStopRef.current = resolve;
      rejectStopRef.current = reject;

      try {
        recorder.stop();
      } catch (e) {
        resetStopPromiseRefs();
        setStatus('error');
        setError('Failed to stop recording');
        reject(e);
      }
    });
  }, [clearTimers, resetStopPromiseRefs]);

  const startRecording = useCallback(
    async (stream: MediaStream, options: IssueRecorderStartOptions = {}) => {
      if (!isSupported) {
        setStatus('error');
        setError('MediaRecorder is not supported in this browser');
        throw new Error('MediaRecorder unsupported');
      }

      if (!stream || stream.getTracks().length === 0) {
        setStatus('error');
        setError('No capture stream available for recording');
        throw new Error('No stream');
      }

      // If an old recorder exists, reset first.
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        cancelRecording();
      }

      setStatus('preparing');
      setError(null);
      chunksRef.current = [];
      setElapsedMs(0);

      const candidates =
        options.mimeTypeCandidates ||
        defaults.mimeTypeCandidates ||
        DEFAULT_MIME_CANDIDATES;

      const selectedMimeType = pickSupportedRecorderMimeType(candidates);
      if (!selectedMimeType) {
        setStatus('error');
        setError('No supported video recording format found');
        throw new Error('Unsupported recording format');
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond:
          options.videoBitsPerSecond ?? defaults.videoBitsPerSecond,
        audioBitsPerSecond:
          options.audioBitsPerSecond ?? defaults.audioBitsPerSecond,
      });

      recorderRef.current = recorder;
      setMimeType(selectedMimeType);

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setStatus('error');
        setError('Recording failed unexpectedly');
        rejectStopRef.current?.(new Error('Recording error'));
        resetStopPromiseRefs();
      };

      recorder.onstop = () => {
        const outputBlob = new Blob(chunksRef.current, {
          type: selectedMimeType,
        });

        clearTimers();
        recorderRef.current = null;
        startedAtRef.current = null;
        chunksRef.current = [];

        setStatus('idle');
        setElapsedMs(0);

        resolveStopRef.current?.(outputBlob);
        resetStopPromiseRefs();
      };

      recorder.start(250);
      startedAtRef.current = Date.now();
      setStatus('recording');

      elapsedIntervalRef.current = window.setInterval(() => {
        if (!startedAtRef.current) return;
        setElapsedMs(Date.now() - startedAtRef.current);
      }, 100);

      const maxDurationMs = options.maxDurationMs ?? defaults.maxDurationMs;
      if (maxDurationMs && maxDurationMs > 0) {
        stopTimeoutRef.current = window.setTimeout(() => {
          if (recorderRef.current?.state === 'recording') {
            options.onMaxDurationReached?.();
            void stopRecording().catch(() => {
              // Ignore here; error state is set in stopRecording path if needed.
            });
          }
        }, maxDurationMs);
      }
    },
    [
      cancelRecording,
      clearTimers,
      defaults.audioBitsPerSecond,
      defaults.maxDurationMs,
      defaults.mimeTypeCandidates,
      defaults.videoBitsPerSecond,
      isSupported,
      resetStopPromiseRefs,
      stopRecording,
    ],
  );

  useEffect(() => () => cancelRecording(), [cancelRecording]);

  return {
    status,
    error,
    elapsedMs,
    mimeType,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
