import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { ParentGate } from '../ui/ParentGate';
import { issueReportsApi } from '../../services/api';
import {
  buildIssueReportClipFormData,
  buildIssueReportMetadata,
} from '../../services/issueReportingUpload';
import { IssueReportCompositor } from './IssueReportCompositor';
import { useIssueRecorder } from '../../hooks/useIssueRecorder';

type IssueReportStep =
  | 'intro'
  | 'recording'
  | 'preview'
  | 'submitting'
  | 'success'
  | 'error';

const MAX_DURATION_MS = 45_000;
const QUICK_TAGS = [
  'Game froze',
  'Gesture not detected',
  'Wrong scoring',
  'Audio issue',
  'Other',
] as const;

interface IssueReportFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceCanvas: HTMLCanvasElement | null;
  gameId: string;
  activityId?: string;
  cameraMaskRegion?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export function IssueReportFlowModal({
  isOpen,
  onClose,
  sourceCanvas,
  gameId,
  activityId,
  cameraMaskRegion,
}: IssueReportFlowModalProps) {
  const [step, setStep] = useState<IssueReportStep>('intro');
  const [captureStream, setCaptureStream] = useState<MediaStream | null>(null);
  const [clipBlob, setClipBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showParentGate, setShowParentGate] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [recordedDurationMs, setRecordedDurationMs] = useState(0);

  const stopInProgressRef = useRef(false);

  const {
    status,
    error,
    elapsedMs,
    mimeType,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useIssueRecorder();

  const canStartRecording = useMemo(
    () => Boolean(captureStream) && isSupported,
    [captureStream, isSupported],
  );

  useEffect(() => {
    if (!isOpen) return;

    setStep('intro');
    setErrorMessage(null);
    setReportId(null);
    setSelectedTags([]);
    setRecordedDurationMs(0);
    stopInProgressRef.current = false;

    return () => {
      cancelRecording();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setClipBlob(null);
      setCaptureStream(null);
      setShowParentGate(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (step !== 'recording') return;
    if (elapsedMs < MAX_DURATION_MS) return;

    void handleStopRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedMs, step]);

  const handleClose = () => {
    cancelRecording();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setClipBlob(null);
    setCaptureStream(null);
    setShowParentGate(false);
    onClose();
  };

  const handleStartRecording = async () => {
    if (!captureStream) {
      setErrorMessage('Recording stream not ready yet. Please try again.');
      return;
    }

    try {
      setErrorMessage(null);
      await startRecording(captureStream);
      setStep('recording');
    } catch (e) {
      setStep('error');
      setErrorMessage(
        e instanceof Error ? e.message : 'Could not start recording.',
      );
    }
  };

  const handleStopRecording = async () => {
    if (stopInProgressRef.current) return;
    if (status !== 'recording') return;

    stopInProgressRef.current = true;

    try {
      const blob = await stopRecording();
      const url = URL.createObjectURL(blob);
      setClipBlob(blob);
      setPreviewUrl(url);
      setRecordedDurationMs(elapsedMs);
      setStep('preview');
    } catch {
      setStep('error');
      setErrorMessage('Could not finish recording. Please try again.');
    } finally {
      stopInProgressRef.current = false;
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const submitIssueReport = async () => {
    if (!clipBlob) {
      setStep('error');
      setErrorMessage('No recording available for submission.');
      return;
    }

    try {
      setStep('submitting');
      setErrorMessage(null);

      const metadata = buildIssueReportMetadata({
        gameId,
        activityId,
        issueTags: selectedTags,
        appVersion: '1.0.0',
        sessionId:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}`,
      });

      const sessionResp = await issueReportsApi.createSession({
        game_id: gameId,
        activity_id: activityId,
        issue_tags: selectedTags,
        app_version: '1.0.0',
        session_id:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}`,
        device_info: {
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          language: typeof navigator !== 'undefined' ? navigator.language : '',
          platform:
            typeof navigator !== 'undefined' ? navigator.platform || '' : '',
        },
      });

      const createdReportId = sessionResp.data.report_id;
      const uploadForm = buildIssueReportClipFormData(clipBlob, {
        reportId: createdReportId,
        mimeType: mimeType || clipBlob.type,
      });

      const uploadResp = await issueReportsApi.uploadClip(
        createdReportId,
        uploadForm,
      );

      await issueReportsApi.finalizeReport(createdReportId, {
        duration_seconds: Math.max(1, Math.round(recordedDurationMs / 1000)),
        mime_type: uploadResp.data.mime_type || mimeType || clipBlob.type,
        file_size_bytes: uploadResp.data.file_size_bytes || clipBlob.size,
        redaction_applied: true,
        metadata,
      });

      setReportId(createdReportId);
      setStep('success');
    } catch (e) {
      setStep('error');
      setErrorMessage(
        e instanceof Error
          ? e.message
          : 'Failed to submit issue report. Please try again.',
      );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className='fixed inset-0 z-[70] bg-slate-900/70 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ y: 24, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0, scale: 0.97 }}
          className='w-full max-w-3xl bg-white border-3 border-[#F2CC8F] rounded-[2rem] shadow-[0_8px_0_#E5B86E] p-6 md:p-8'
        >
          <IssueReportCompositor
            sourceCanvas={sourceCanvas}
            width={sourceCanvas?.width || 1280}
            height={sourceCanvas?.height || 720}
            active={isOpen}
            maskRegion={
              cameraMaskRegion
                ? {
                    ...cameraMaskRegion,
                    label: 'Camera hidden for privacy',
                  }
                : undefined
            }
            onStreamReady={setCaptureStream}
            className='hidden'
          />

          <div className='flex items-start justify-between gap-4 mb-4'>
            <div>
              <h2 className='text-2xl md:text-3xl font-black text-advay-slate'>
                Report an Issue
              </h2>
              <p className='text-sm md:text-base font-bold text-text-secondary mt-1'>
                Record what happened. Camera feed is hidden for privacy.
              </p>
            </div>
            <button
              onClick={handleClose}
              className='px-4 py-2 rounded-xl border-3 border-[#F2CC8F] font-black text-advay-slate bg-white hover:bg-slate-50'
            >
              Close
            </button>
          </div>

          {step === 'intro' && (
            <div className='space-y-4'>
              <div className='rounded-[1.25rem] border-3 border-blue-200 bg-blue-50 p-4'>
                <p className='text-blue-700 font-bold'>
                  ✅ Privacy: your camera tile is blacked out in the submitted clip.
                </p>
                <p className='text-blue-600 font-semibold mt-1 text-sm'>
                  Mic is off by default.
                </p>
              </div>

              {!isSupported && (
                <div className='rounded-[1rem] border-3 border-red-200 bg-red-50 p-3 text-red-700 font-bold'>
                  This browser does not support in-app recording.
                </div>
              )}

              {error && (
                <div className='rounded-[1rem] border-3 border-red-200 bg-red-50 p-3 text-red-700 font-bold'>
                  {error}
                </div>
              )}

              <button
                onClick={handleStartRecording}
                disabled={!canStartRecording}
                className='w-full py-4 rounded-[1rem] font-black text-white bg-[#E85D04] border-3 border-[#D00000] disabled:opacity-60'
              >
                Start Recording
              </button>
            </div>
          )}

          {step === 'recording' && (
            <div className='space-y-4'>
              <div className='rounded-[1.25rem] border-3 border-[#F2CC8F] bg-[#FFF8F0] p-4'>
                <p className='font-black text-advay-slate text-lg'>
                  Recording… {Math.floor(elapsedMs / 1000)}s / {MAX_DURATION_MS / 1000}s
                </p>
                <p className='text-sm font-semibold text-text-secondary mt-1'>
                  Reproduce the problem, then stop.
                </p>
              </div>

              <button
                onClick={() => {
                  void handleStopRecording();
                }}
                className='w-full py-4 rounded-[1rem] font-black text-white bg-[#3B82F6] border-3 border-blue-500'
              >
                Stop Recording
              </button>
            </div>
          )}

          {step === 'preview' && (
            <div className='space-y-4'>
              {previewUrl && (
                <video
                  className='w-full rounded-[1rem] border-3 border-[#F2CC8F] bg-black'
                  controls
                  src={previewUrl}
                />
              )}

              <div>
                <p className='font-black text-advay-slate mb-2'>Select issue tags:</p>
                <div className='flex flex-wrap gap-2'>
                  {QUICK_TAGS.map((tag) => {
                    const active = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-2 rounded-xl border-2 font-bold transition ${
                          active
                            ? 'bg-[#E85D04] text-white border-[#D00000]'
                            : 'bg-white text-advay-slate border-[#F2CC8F]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <button
                  onClick={() => {
                    setShowParentGate(true);
                  }}
                  className='py-3 rounded-[1rem] font-black text-white bg-[#10B981] border-3 border-emerald-500'
                >
                  Send Report
                </button>
                <button
                  onClick={() => {
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                    setClipBlob(null);
                    setStep('intro');
                  }}
                  className='py-3 rounded-[1rem] font-black text-advay-slate bg-white border-3 border-[#F2CC8F]'
                >
                  Record Again
                </button>
              </div>
            </div>
          )}

          {step === 'submitting' && (
            <div className='rounded-[1.25rem] border-3 border-[#F2CC8F] bg-[#FFF8F0] p-4'>
              <p className='font-black text-advay-slate text-lg'>Submitting your report…</p>
              <p className='text-sm font-semibold text-text-secondary mt-1'>
                Please wait while we securely upload the clip.
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className='space-y-3'>
              <div className='rounded-[1.25rem] border-3 border-emerald-300 bg-emerald-50 p-4'>
                <p className='font-black text-emerald-700 text-lg'>✅ Report sent successfully!</p>
                <p className='text-sm font-semibold text-emerald-700 mt-1'>
                  Reference ID: <span className='font-black'>{reportId}</span>
                </p>
              </div>
              <button
                onClick={handleClose}
                className='w-full py-3 rounded-[1rem] font-black text-white bg-[#3B82F6] border-3 border-blue-500'
              >
                Done
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className='space-y-3'>
              <div className='rounded-[1.25rem] border-3 border-red-300 bg-red-50 p-4'>
                <p className='font-black text-red-700 text-lg'>Could not submit report</p>
                <p className='text-sm font-semibold text-red-700 mt-1'>
                  {errorMessage || 'Please try again.'}
                </p>
              </div>
              <button
                onClick={() => setStep('intro')}
                className='w-full py-3 rounded-[1rem] font-black text-white bg-[#E85D04] border-3 border-[#D00000]'
              >
                Try Again
              </button>
            </div>
          )}

          {showParentGate && (
            <ParentGate
              isOpen={showParentGate}
              onUnlock={() => {
                setShowParentGate(false);
                void submitIssueReport();
              }}
              onCancel={() => setShowParentGate(false)}
              title='Parent Confirmation'
              message='Hold to confirm sending this issue report.'
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default IssueReportFlowModal;
