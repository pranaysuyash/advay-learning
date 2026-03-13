import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackLaunchEvent } from '../../analytics/launch';
import { consentApi, type ConsentRecord } from '../../services/api';
import { Button } from '../ui/Button';

export type ConsentStep =
  | 'disclosure'
  | 'verification-method'
  | 'email-verify'
  | 'declaration'
  | 'complete';

export interface ConsentData {
  consentId: string;
  parentEmail: string;
  childId?: string;
  childName?: string;
  verificationMethod: 'email' | 'declaration';
  consentTimestamp: string;
  consentVersion: string;
  emailVerified: boolean;
  declarationSigned: boolean;
  status: 'pending' | 'verified' | 'withdrawn' | 'expired';
}

interface ParentalConsentFlowProps {
  parentEmail: string;
  childId?: string;
  childName: string;
  onConsentComplete: (consentData: ConsentData) => void;
  onCancel: () => void;
}

const CONSENT_VERSION = '1.0';
const DATA_PURPOSE = 'Educational activity personalization and progress tracking';

function mapConsent(consent: ConsentRecord): ConsentData {
  return {
    consentId: consent.id,
    parentEmail: consent.parent_email,
    childId: consent.child_id ?? undefined,
    childName: consent.child_name ?? undefined,
    verificationMethod:
      consent.verification_method === 'declaration' ? 'declaration' : 'email',
    consentTimestamp: consent.consent_timestamp ?? consent.updated_at,
    consentVersion: consent.consent_version,
    emailVerified: consent.email_verified,
    declarationSigned: consent.declaration_signed,
    status: consent.status,
  };
}

export function ParentalConsentFlow({
  parentEmail,
  childId,
  childName,
  onConsentComplete,
  onCancel,
}: ParentalConsentFlowProps) {
  const [step, setStep] = useState<ConsentStep>('disclosure');
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'declaration'>('email');
  const [emailCode, setEmailCode] = useState('');
  const [consentRecord, setConsentRecord] = useState<ConsentRecord | null>(null);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const disclosureChildName = useMemo(() => childName || 'your child', [childName]);

  const createConsent = async (method: 'email' | 'declaration') => {
    setIsWorking(true);
    setError(null);
    try {
      const response = await consentApi.create({
        parent_email: parentEmail,
        child_id: childId,
        child_name: childName,
        verification_method: method,
        consent_version: CONSENT_VERSION,
        data_processing_purpose: DATA_PURPOSE,
      });
      setConsentRecord(response.data);
      trackLaunchEvent('consent_started', { method, childId: childId ?? 'unknown' });
      if (method === 'email') {
        trackLaunchEvent('consent_email_sent', { childId: childId ?? 'unknown' });
        setStep('email-verify');
      } else {
        setStep('declaration');
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Unable to start parental consent right now.');
      trackLaunchEvent('consent_failed', { stage: 'create', method });
    } finally {
      setIsWorking(false);
    }
  };

  const verifyEmailCode = async () => {
    if (!consentRecord) return;
    setIsWorking(true);
    setError(null);
    trackLaunchEvent('consent_code_submitted', { childId: childId ?? 'unknown' });
    try {
      const response = await consentApi.verify(consentRecord.id, {
        verification_method: 'email',
        email_code: emailCode,
      });
      setConsentRecord(response.data);
      setStep('complete');
      trackLaunchEvent('consent_completed', {
        method: 'email',
        childId: childId ?? 'unknown',
      });
      onConsentComplete(mapConsent(response.data));
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Verification code was not accepted.');
      trackLaunchEvent('consent_failed', { stage: 'verify_email' });
    } finally {
      setIsWorking(false);
    }
  };

  const signDeclaration = async () => {
    if (!consentRecord || !declarationAccepted) return;
    setIsWorking(true);
    setError(null);
    try {
      const response = await consentApi.verify(consentRecord.id, {
        verification_method: 'declaration',
        declaration_accepted: true,
      });
      setConsentRecord(response.data);
      setStep('complete');
      trackLaunchEvent('consent_completed', {
        method: 'declaration',
        childId: childId ?? 'unknown',
      });
      onConsentComplete(mapConsent(response.data));
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Unable to complete declaration consent.');
      trackLaunchEvent('consent_failed', { stage: 'declaration' });
    } finally {
      setIsWorking(false);
    }
  };

  const handleCancel = () => {
    trackLaunchEvent('consent_abandoned', {
      method: verificationMethod,
      childId: childId ?? 'unknown',
    });
    onCancel();
  };

  return (
    <div className='w-full max-w-lg mx-auto'>
      <AnimatePresence mode='wait'>
        {step === 'disclosure' && (
          <motion.div
            key='disclosure'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='bg-white rounded-3xl border-4 border-[#F2CC8F] p-6 shadow-[0_6px_0_#E5B86E]'
          >
            <h3 className='text-xl font-black text-advay-slate mb-2'>Parental Consent Required</h3>
            <p className='text-sm text-text-secondary mb-4 font-medium'>Before {disclosureChildName} can use Advay, we need your consent for child-profile data and progress tracking.</p>
            <div className='bg-amber-50 rounded-2xl p-4 mb-4 border-2 border-amber-200 text-sm font-bold text-amber-800'>
              Camera processing stays on-device. We do not store child profile photos, raw camera video, or ad-tracking data during beta.
            </div>
            <div className='flex gap-3'>
              <Button variant='secondary' onClick={handleCancel} className='flex-1'>Cancel</Button>
              <Button onClick={() => setStep('verification-method')} className='flex-1'>Continue</Button>
            </div>
          </motion.div>
        )}

        {step === 'verification-method' && (
          <motion.div
            key='method'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='bg-white rounded-3xl border-4 border-[#F2CC8F] p-6 shadow-[0_6px_0_#E5B86E]'
          >
            <h3 className='text-xl font-black text-advay-slate mb-2'>Choose verification</h3>
            <p className='text-sm text-text-secondary mb-6'>Public beta uses email-code verification or a parent declaration. Payment-based verification is out of launch scope.</p>
            <div className='space-y-3'>
              <button
                onClick={() => {
                  setVerificationMethod('email');
                  void createConsent('email');
                }}
                className='w-full rounded-2xl border-2 border-slate-200 p-4 text-left hover:border-blue-400 hover:bg-blue-50 transition'
                disabled={isWorking}
              >
                <div className='font-black text-advay-slate'>Email verification</div>
                <div className='text-xs text-text-secondary'>Send a 6-digit code to {parentEmail}</div>
              </button>
              <button
                onClick={() => {
                  setVerificationMethod('declaration');
                  void createConsent('declaration');
                }}
                className='w-full rounded-2xl border-2 border-slate-200 p-4 text-left hover:border-amber-400 hover:bg-amber-50 transition'
                disabled={isWorking}
              >
                <div className='font-black text-advay-slate'>Parent declaration</div>
                <div className='text-xs text-text-secondary'>Fastest option for beta access with an in-app legal declaration.</div>
              </button>
            </div>
            {error && <p className='mt-4 text-sm font-bold text-red-600'>{error}</p>}
            <button onClick={() => setStep('disclosure')} className='mt-4 text-sm font-medium text-text-secondary'>← Back</button>
          </motion.div>
        )}

        {step === 'email-verify' && (
          <motion.div
            key='email'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='bg-white rounded-3xl border-4 border-[#F2CC8F] p-6 shadow-[0_6px_0_#E5B86E]'
          >
            <h3 className='text-xl font-black text-advay-slate mb-2'>Check your email</h3>
            <p className='text-sm text-text-secondary mb-4'>We sent a 6-digit code to <strong>{parentEmail}</strong>.</p>
            <label className='block text-sm font-bold text-advay-slate mb-2'>Enter code</label>
            <input
              type='text'
              inputMode='numeric'
              maxLength={6}
              value={emailCode}
              onChange={(event) => setEmailCode(event.target.value.replace(/\D/g, ''))}
              className='w-full rounded-2xl border-2 border-slate-200 p-4 text-center text-3xl font-black tracking-[0.6em] focus:outline-none focus:border-blue-500'
              placeholder='000000'
            />
            {error && <p className='mt-4 text-sm font-bold text-red-600'>{error}</p>}
            <div className='mt-4 flex gap-3'>
              <Button variant='secondary' onClick={() => setStep('verification-method')} className='flex-1'>Back</Button>
              <Button onClick={() => void verifyEmailCode()} disabled={emailCode.length !== 6 || isWorking} className='flex-1'>Verify code</Button>
            </div>
          </motion.div>
        )}

        {step === 'declaration' && (
          <motion.div
            key='declaration'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='bg-white rounded-3xl border-4 border-[#F2CC8F] p-6 shadow-[0_6px_0_#E5B86E]'
          >
            <h3 className='text-xl font-black text-advay-slate mb-2'>Parent declaration</h3>
            <div className='bg-slate-50 rounded-2xl border-2 border-slate-200 p-4 text-sm text-slate-600'>
              I confirm that I am the parent or legal guardian of {disclosureChildName}, that I am 18 or older, and that I consent to account setup, child profile storage, progress tracking, and locally processed camera play as described in the Privacy Promise.
            </div>
            <label className='mt-4 flex items-start gap-3 text-sm text-text-secondary cursor-pointer'>
              <input
                type='checkbox'
                checked={declarationAccepted}
                onChange={(event) => setDeclarationAccepted(event.target.checked)}
                className='mt-1 h-5 w-5'
              />
              <span>I understand I can export data, delete profiles, delete the account, or withdraw consent later from parent controls.</span>
            </label>
            {error && <p className='mt-4 text-sm font-bold text-red-600'>{error}</p>}
            <div className='mt-4 flex gap-3'>
              <Button variant='secondary' onClick={() => setStep('verification-method')} className='flex-1'>Back</Button>
              <Button onClick={() => void signDeclaration()} disabled={!declarationAccepted || isWorking} className='flex-1'>Complete consent</Button>
            </div>
          </motion.div>
        )}

        {step === 'complete' && consentRecord && (
          <motion.div
            key='complete'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='bg-white rounded-3xl border-4 border-[#F2CC8F] p-6 shadow-[0_6px_0_#E5B86E] text-center'
          >
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl'>✅</div>
            <h3 className='text-2xl font-black text-advay-slate'>Consent verified</h3>
            <p className='mt-3 text-sm font-bold text-text-secondary'>You can now continue setting up {disclosureChildName}'s profile and start the beta.</p>
            <Button className='mt-6 w-full' onClick={() => onConsentComplete(mapConsent(consentRecord))}>Continue</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ParentalConsentFlow;
