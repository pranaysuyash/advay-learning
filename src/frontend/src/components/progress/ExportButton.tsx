/**
 * ExportButton Component
 * Allows parents to download/share progress reports
 */
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReportData, downloadTextReport, generateWhatsAppShareUrl, copyReportToClipboard } from '../../utils/reportExport';
import { UIIcon } from '../ui/Icon';

interface ExportButtonProps {
  data: ReportData;
}

export function ExportButton({ data }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    const success = await copyReportToClipboard(data);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setIsOpen(false);
  };

  const handleDownload = () => {
    downloadTextReport(data);
    setIsOpen(false);
  };

  const handleWhatsApp = () => {
    const url = generateWhatsAppShareUrl(data);
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={buttonRef}>
      {/* Main Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl font-bold border-2 border-[#000] shadow-[0_4px_0_0_#000] active:translate-y-[4px] active:shadow-none transition-all"
      >
        <UIIcon name="download" size={18} />
        <span>Export Report</span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 bg-white border-2 border-[#F2CC8F] rounded-2xl shadow-lg z-50 overflow-hidden"
            >
              {/* Copy to Clipboard */}
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border-2 border-blue-100">
                  <UIIcon name="copy" size={18} className="text-blue-500" />
                </div>
                <div>
                  <div className="font-bold text-advay-slate">Copy Text</div>
                  <div className="text-xs text-slate-400">Copy to clipboard</div>
                </div>
              </button>

              <div className="h-px bg-slate-100 mx-4" />

              {/* Download as File */}
              <button
                onClick={handleDownload}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border-2 border-emerald-100">
                  <UIIcon name="file-text" size={18} className="text-emerald-500" />
                </div>
                <div>
                  <div className="font-bold text-advay-slate">Download .txt</div>
                  <div className="text-xs text-slate-400">Save as text file</div>
                </div>
              </button>

              <div className="h-px bg-slate-100 mx-4" />

              {/* Share to WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border-2 border-green-100">
                  <span className="text-lg">💬</span>
                </div>
                <div>
                  <div className="font-bold text-advay-slate">Share to WhatsApp</div>
                  <div className="text-xs text-slate-400">Send to teacher/family</div>
                </div>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Copied Toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute right-0 top-full mt-2 px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl text-sm whitespace-nowrap z-50"
          >
            Copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Compact export button for smaller spaces
 */
export function ExportButtonCompact({ data }: ExportButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyReportToClipboard(data);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl border-2 border-[#F2CC8F] transition-colors"
        title="Copy report"
      >
        <UIIcon name="copy" size={18} className="text-advay-slate" />
      </button>
      <button
        onClick={() => downloadTextReport(data)}
        className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl border-2 border-[#F2CC8F] transition-colors"
        title="Download report"
      >
        <UIIcon name="download" size={18} className="text-advay-slate" />
      </button>
      {copied && (
        <span className="text-xs font-bold text-emerald-600">Copied!</span>
      )}
    </div>
  );
}
