import { Link } from 'react-router-dom';
import { trackLaunchEvent } from '../analytics/launch';
import { BETA_END_DATE, BETA_LABEL, SUPPORT_EMAIL } from '../config/launch';

export function TermsOfPlay() {
  return (
    <section className='min-h-screen bg-[#FFF8F0] px-6 py-16 font-nunito text-slate-800'>
      <div className='mx-auto max-w-4xl space-y-8'>
        <header className='space-y-4'>
          <p className='text-sm font-black uppercase tracking-[0.3em] text-[#E85D04]'>{BETA_LABEL}</p>
          <h1 className='text-5xl font-black tracking-tight'>Terms of Play</h1>
          <p className='text-lg font-bold text-slate-600'>These terms govern the public beta and set expectations for parent accounts, beta access, and support.</p>
        </header>

        <div className='space-y-6 rounded-[2rem] border-4 border-[#F2CC8F] bg-white p-8 shadow-[0_6px_0_#E5B86E]'>
          <p className='font-bold text-slate-600'>1. The service is free only during beta, which is currently planned through {BETA_END_DATE}.</p>
          <p className='font-bold text-slate-600'>2. Features, pricing, and availability may change after beta.</p>
          <p className='font-bold text-slate-600'>3. Parent accounts are responsible for supervising child use and keeping credentials secure.</p>
          <p className='font-bold text-slate-600'>4. Camera processing is intended to stay on device; do not attempt to upload child photos as identity images during beta.</p>
          <p className='font-bold text-slate-600'>5. Beta support is founder-run and best effort. Contact {SUPPORT_EMAIL} for help.</p>
          <p className='font-bold text-slate-600'>6. You may stop using the service at any time and can export or delete your data from Settings.</p>
        </div>

        <div className='flex flex-wrap gap-4 text-sm font-black'>
          <Link to='/privacy' className='text-[#3B82F6]' onClick={() => trackLaunchEvent('nav_link_clicked', { destination: '/privacy', source: 'terms_page' })}>Read the privacy promise</Link>
          <Link to='/support' className='text-[#3B82F6]' onClick={() => trackLaunchEvent('support_contact_clicked', { source: 'terms_page' })}>Contact support</Link>
        </div>
      </div>
    </section>
  );
}

export default TermsOfPlay;
