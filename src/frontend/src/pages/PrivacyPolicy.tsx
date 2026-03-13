import { Link } from 'react-router-dom';
import { trackLaunchEvent } from '../analytics/launch';
import { BETA_END_DATE, BETA_LABEL, SUPPORT_EMAIL, SUPPORTED_DEVICES } from '../config/launch';

export function PrivacyPolicy() {
  return (
    <section className='min-h-screen bg-[#FFF8F0] px-6 py-16 font-nunito text-slate-800'>
      <div className='mx-auto max-w-4xl space-y-8'>
        <header className='space-y-4'>
          <p className='text-sm font-black uppercase tracking-[0.3em] text-[#E85D04]'>{BETA_LABEL} privacy</p>
          <h1 className='text-5xl font-black tracking-tight'>Privacy Promise</h1>
          <p className='text-lg font-bold text-slate-600'>
            Advay uses the camera for play on your device. We do not store child photos or raw camera video during the beta.
          </p>
        </header>

        <div className='grid gap-6 md:grid-cols-2'>
          <article className='rounded-[2rem] border-4 border-[#F2CC8F] bg-white p-6 shadow-[0_6px_0_#E5B86E]'>
            <h2 className='text-2xl font-black mb-3'>What we store</h2>
            <ul className='space-y-2 text-sm font-bold text-slate-600'>
              <li>Parent account email and authentication state</li>
              <li>Child profile basics like name, age, and preferred language</li>
              <li>Learning progress, session summaries, and beta analytics events</li>
              <li>Parental-consent records and audit logs</li>
            </ul>
          </article>
          <article className='rounded-[2rem] border-4 border-[#F2CC8F] bg-white p-6 shadow-[0_6px_0_#E5B86E]'>
            <h2 className='text-2xl font-black mb-3'>What we do not store</h2>
            <ul className='space-y-2 text-sm font-bold text-slate-600'>
              <li>Raw camera frames, child photos, or facial-image libraries</li>
              <li>Third-party ad identifiers or cross-site tracking profiles</li>
              <li>Freeform child voice/video recordings for analytics</li>
              <li>Payment data during the free beta</li>
            </ul>
          </article>
        </div>

        <article className='rounded-[2rem] border-4 border-[#F2CC8F] bg-white p-8 shadow-[0_6px_0_#E5B86E] space-y-4'>
          <h2 className='text-2xl font-black'>Parent controls and data rights</h2>
          <p className='font-bold text-slate-600'>Parents can export account data, delete child profiles, delete the account, and withdraw consent. These controls are available in Settings during the beta.</p>
          <p className='font-bold text-slate-600'>If you need help, contact <a className='text-[#3B82F6]' href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
        </article>

        <article className='rounded-[2rem] border-4 border-[#F2CC8F] bg-white p-8 shadow-[0_6px_0_#E5B86E] space-y-4'>
          <h2 className='text-2xl font-black'>Supported devices during beta</h2>
          <ul className='space-y-2 text-sm font-bold text-slate-600'>
            {SUPPORTED_DEVICES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className='font-bold text-slate-600'>Free beta access is scheduled through {BETA_END_DATE}. We may change pricing and feature availability after beta.</p>
        </article>

        <div className='flex flex-wrap gap-4 text-sm font-black'>
          <Link to='/terms' className='text-[#3B82F6]' onClick={() => trackLaunchEvent('nav_link_clicked', { destination: '/terms', source: 'privacy_page' })}>Read the terms</Link>
          <Link to='/support' className='text-[#3B82F6]' onClick={() => trackLaunchEvent('support_contact_clicked', { source: 'privacy_page' })}>Contact support</Link>
        </div>
      </div>
    </section>
  );
}

export default PrivacyPolicy;
