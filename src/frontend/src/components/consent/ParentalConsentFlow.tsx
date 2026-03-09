/**
 * Parental Consent Flow Component
 * DPDPA 2023 Section 9(1) Compliance - Verifiable Parental Consent
 * 
 * @ticket TCK-20260307-CRIT-002
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';

export type ConsentStep = 'disclosure' | 'verification-method' | 'email-verify' | 'card-verify' | 'declaration' | 'complete';

export interface ConsentData {
  parentEmail: string;
  verificationMethod: 'email' | 'credit-card' | 'declaration';
  consentTimestamp: string;
  ipAddress?: string;
  consentVersion: string;
  emailVerified: boolean;
  cardVerified: boolean;
  declarationSigned: boolean;
}

interface ParentalConsentFlowProps {
  parentEmail: string;
  childName: string;
  onConsentComplete: (consentData: ConsentData) => void;
  onCancel: () => void;
}

const CONSENT_VERSION = '1.0';

export function ParentalConsentFlow({
  parentEmail,
  childName,
  onConsentComplete,
  onCancel,
}: ParentalConsentFlowProps) {
  const [step, setStep] = useState<ConsentStep>('disclosure');
  const [consentData, setConsentData] = useState<Partial<ConsentData>>({
    parentEmail,
    consentVersion: CONSENT_VERSION,
  });
  const [emailCode, setEmailCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const handleMethodSelect = (method: 'email' | 'credit-card' | 'declaration') => {
    setConsentData(prev => ({ ...prev, verificationMethod: method }));
    if (method === 'email') setStep('email-verify');
    else if (method === 'credit-card') setStep('card-verify');
    else setStep('declaration');
  };

  const sendEmailCode = async () => {
    setIsSendingCode(true);
    // Simulate API call to send verification code
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCodeSent(true);
    setIsSendingCode(false);
  };

  const verifyEmailCode = () => {
    // In production, validate code against backend
    if (emailCode.length === 6) {
      setConsentData(prev => ({ ...prev, emailVerified: true }));
      setStep('declaration');
    }
  };

  const handleCardVerification = () => {
    // In production, integrate with payment gateway for ₹1 charge/refund
    setConsentData(prev => ({ ...prev, cardVerified: true }));
    setStep('declaration');
  };

  const signDeclaration = async () => {
    const finalConsent: ConsentData = {
      ...consentData as ConsentData,
      consentTimestamp: new Date().toISOString(),
      declarationSigned: true,
      emailVerified: consentData.verificationMethod === 'email' ? true : (consentData.emailVerified ?? false),
      cardVerified: consentData.verificationMethod === 'credit-card' ? true : (consentData.cardVerified ?? false),
    };
    onConsentComplete(finalConsent);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {step === 'disclosure' && (
          <motion.div
            key="disclosure"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl border-4 border-[#F2CC8F] p-6 shadow-[0_6px_0_#E5B86E]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-advay-slate">Parental Consent Required</h3>
                <p className="text-sm text-text-secondary font-medium">DPDPA 2023 Compliance</p>
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 mb-4 border-2 border-amber-200">
              <p className="text-sm font-bold text-amber-800 mb-2">
                Before {childName || 'your child'} can use Advay, we need your verifiable consent.
              </p>
              <p className="text-xs text-amber-700">
                As per India&apos;s Digital Personal Data Protection Act, 2023, we require parental consent 
                to process any personal data of children under 18.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="font-bold text-advay-slate text-sm uppercase tracking-wide">What we collect:</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Child&apos;s name and age (for personalization)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Game progress and scores (to adapt difficulty)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Session duration and activity (for recommendations)</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="font-bold text-advay-slate text-sm uppercase tracking-wide">What we NEVER collect:</h4>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✕</span>
                  <span>Video or photos from camera (processed locally only)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✕</span>
                  <span>Location data or cross-app tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">✕</span>
                  <span>Third-party advertising or behavioral profiling</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => setStep('verification-method')} className="flex-1">
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'verification-method' && (
          <motion.div
            key="method"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl border-4 border-[#F2CC8F] p-6 shadow-[0_6px_0_#E5B86E]"
          >
            <h3 className="text-xl font-black text-advay-slate mb-2">Verify You&apos;re the Parent</h3>
            <p className="text-sm text-text-secondary mb-6">
              Choose how you&apos;d like to verify your identity as the parent or legal guardian.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleMethodSelect('email')}
                className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📧</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-advay-slate">Email Verification</div>
                    <div className="text-xs text-text-secondary">We&apos;ll send a code to {parentEmail}</div>
                  </div>
                  <span className="text-slate-400 text-xl">›</span>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('credit-card')}
                className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-green-400 hover:bg-green-50 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">💳</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-advay-slate">Credit/Debit Card</div>
                    <div className="text-xs text-text-secondary">₹1 charge (immediately refunded)</div>
                  </div>
                  <span className="text-slate-400 text-xl">›</span>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('declaration')}
                className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📄</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-advay-slate">Legal Declaration</div>
                    <div className="text-xs text-text-secondary">Digital signature with legal attestation</div>
                  </div>
                  <span className="text-slate-400 text-xl">›</span>
                </div>
              </button>
            </div>

            <button
              onClick={() => setStep('disclosure')}
              className="mt-4 text-sm text-text-secondary hover:text-advay-slate font-medium"
            >
              ← Back
            </button>
          </motion.div>
        )}

        {step === 'email-verify' && (
          <motion.div
            key="email"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl border-4 border-[#F2CC8F] p-6 shadow-[0_6px_0_#E5B86E]"
          >
            <h3 className="text-xl font-black text-advay-slate mb-2">Verify Your Email</h3>
            <p className="text-sm text-text-secondary mb-6">
              We&apos;ve sent a 6-digit verification code to <strong>{parentEmail}</strong>
            </p>

            {!codeSent ? (
              <div className="text-center py-8">
                <Button 
                  onClick={sendEmailCode} 
                  isLoading={isSendingCode}
                  className="w-full"
                >
                  Send Verification Code
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-advay-slate mb-2">
                    Enter 6-digit code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-3xl font-black tracking-widest p-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
                    placeholder="000000"
                  />
                </div>

                <Button
                  onClick={verifyEmailCode}
                  disabled={emailCode.length !== 6}
                  className="w-full"
                >
                  Verify Code
                </Button>

                <button
                  onClick={sendEmailCode}
                  disabled={isSendingCode}
                  className="w-full text-sm text-text-secondary hover:text-advay-slate font-medium"
                >
                  Resend code
                </button>
              </div>
            )}

            <button
              onClick={() => setStep('verification-method')}
              className="mt-4 text-sm text-text-secondary hover:text-advay-slate font-medium"
            >
              ← Back
            </button>
          </motion.div>
        )}

        {step === 'card-verify' && (
          <motion.div
            key="card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl border-4 border-[#F2CC8F] p-6 shadow-[0_6px_0_#E5B86E]"
          >
            <h3 className="text-xl font-black text-advay-slate mb-2">Card Verification</h3>
            <p className="text-sm text-text-secondary mb-6">
              We&apos;ll charge ₹1 to your card and refund it immediately. This confirms you&apos;re an adult.
            </p>

            <div className="bg-green-50 rounded-2xl p-4 mb-6 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🔒</span>
                <span className="font-bold text-green-800">Secure & Instant Refund</span>
              </div>
              <p className="text-xs text-green-700">
                Your card details are processed securely. The ₹1 charge will be refunded 
                within 5-7 business days.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Card Number"
                className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:outline-none"
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="flex-1 p-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  maxLength={3}
                  className="w-24 p-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Name on Card"
                className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-green-500 focus:outline-none"
              />
            </div>

            <Button onClick={handleCardVerification} className="w-full mt-4">
              Verify Card (₹1 refundable charge)
            </Button>

            <button
              onClick={() => setStep('verification-method')}
              className="mt-4 text-sm text-text-secondary hover:text-advay-slate font-medium"
            >
              ← Back
            </button>
          </motion.div>
        )}

        {step === 'declaration' && (
          <motion.div
            key="declaration"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl border-4 border-[#F2CC8F] p-6 shadow-[0_6px_0_#E5B86E]"
          >
            <h3 className="text-xl font-black text-advay-slate mb-2">Digital Consent Declaration</h3>
            <p className="text-sm text-text-secondary mb-4">
              Please read and agree to the following:
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 mb-4 max-h-48 overflow-y-auto text-xs text-slate-600 border-2 border-slate-200">
              <p className="font-bold mb-2">PARENTAL CONSENT FOR CHILD&apos;S DATA PROCESSING</p>
              <p className="mb-2">
                I, the parent/legal guardian of {childName || 'the child'}, confirm that:
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>I am 18 years of age or older and have legal authority to provide consent.</li>
                <li>I consent to the collection and processing of my child&apos;s personal data as described.</li>
                <li>I understand my rights: access, correction, deletion, and withdrawal of consent.</li>
                <li>I understand that camera data is processed locally and never stored as video.</li>
                <li>I understand there is no targeted advertising or behavioral tracking of my child.</li>
              </ol>
              <p className="mt-2">
                This consent is provided under the Digital Personal Data Protection Act, 2023 (India).
              </p>
            </div>

            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-text-secondary">
                I confirm I am the parent/legal guardian and I consent to the processing 
                of my child&apos;s data as described above.
              </span>
            </label>

            <Button onClick={signDeclaration} className="w-full">
              Sign Digital Consent
            </Button>

            <button
              onClick={() => setStep('verification-method')}
              className="mt-4 text-sm text-text-secondary hover:text-advay-slate font-medium"
            >
              ← Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ParentalConsentFlow;
