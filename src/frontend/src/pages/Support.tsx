import { trackLaunchEvent } from '../analytics/launch';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '../config/launch';

export function Support() {
  return (
    <section className='min-h-screen bg-[#FFF8F0] px-6 py-16 font-nunito text-slate-800'>
      <div className='mx-auto max-w-3xl space-y-8'>
        <header className='space-y-4'>
          <p className='text-sm font-black uppercase tracking-[0.3em] text-[#E85D04]'>Parent support</p>
          <h1 className='text-5xl font-black tracking-tight'>Need help?</h1>
          <p className='text-lg font-bold text-slate-600'>Email support is the fastest path during beta. Include what happened, which game or page you were using, and the device/browser if you know it.</p>
        </header>

        <article className='rounded-[2rem] border-4 border-[#F2CC8F] bg-white p-8 shadow-[0_6px_0_#E5B86E] space-y-4'>
          <p className='text-xl font-black'>Support email</p>
          <a
            href={SUPPORT_MAILTO}
            onClick={() => trackLaunchEvent('support_contact_clicked', { source: 'support_page_email' })}
            className='inline-flex rounded-xl bg-[#3B82F6] px-5 py-3 font-black text-white'
          >
            {SUPPORT_EMAIL}
          </a>
          <ul className='space-y-2 text-sm font-bold text-slate-600'>
            <li>Account, consent, export, and deletion requests are supported during beta.</li>
            <li>For launch feedback, mention whether you were trying to use the free beta or reviewing future pricing.</li>
            <li>Do not email passwords, verification codes, or child photos.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}

export default Support;
