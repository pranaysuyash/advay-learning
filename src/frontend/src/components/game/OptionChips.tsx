import { useId, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { useAudio } from '../../utils/hooks/useAudio';

type Option = {
  id: string;
  label: string;
  sublabel?: string;
  icon?: ReactNode;
  disabled?: boolean;
};

type Props = {
  label: string;
  options: Option[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  theme?: 'light' | 'dark';
  buttonMinHeightClassName?: string;
};

export function OptionChips(props: Props) {
  const {
    label,
    options,
    selectedId,
    onSelect,
    disabled,
    theme = 'light',
    buttonMinHeightClassName,
  } = props;

  const groupId = useId();
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const { playClick, playHover } = useAudio();

  const selectedIndex = useMemo(() => {
    const idx = options.findIndex((opt) => opt.id === selectedId);
    return idx >= 0 ? idx : 0;
  }, [options, selectedId]);

  const baseButton =
    theme === 'dark'
      ? 'bg-black/35 text-white border-2 border-white/20 hover:bg-black/45 shadow-[0_3px_0_rgba(255,255,255,0.2)] hover:translate-y-[1px] hover:shadow-[0_2px_0_rgba(255,255,255,0.2)]'
      : 'bg-white text-advay-slate border-3 border-slate-200 hover:bg-slate-50 shadow-[0_4px_0_#E2E8F0] hover:translate-y-[2px] hover:shadow-[0_2px_0_#E2E8F0]';
  const selectedButton =
    theme === 'dark'
      ? 'bg-white text-advay-slate border-3 border-white shadow-[0_6px_0_rgba(255,255,255,0.8)] translate-y-[-2px]'
      : 'bg-[#F2CC8F] text-advay-slate border-3 border-[#D97706] shadow-[0_6px_0_#B45309] translate-y-[-2px]';
  const disabledButton =
    theme === 'dark'
      ? 'bg-black/20 text-white/50 border-2 border-white/10 cursor-not-allowed shadow-none translate-y-[3px]'
      : 'bg-slate-100 text-slate-400 border-3 border-slate-200 cursor-not-allowed shadow-none translate-y-[4px]';

  return (
    <div
      role='radiogroup'
      aria-label={label}
      className='flex flex-wrap gap-2'
      onKeyDown={(e) => {
        const key = e.key;
        if (
          key !== 'ArrowLeft' &&
          key !== 'ArrowRight' &&
          key !== 'ArrowUp' &&
          key !== 'ArrowDown'
        ) {
          return;
        }
        e.preventDefault();

        const dir = key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 1;
        const nextIndex = (selectedIndex + dir + options.length) % options.length;
        const next = options[nextIndex];
        if (!next) return;

        // Move focus and select (radio-like behavior).
        buttonRefs.current[nextIndex]?.focus();
        if (!disabled && !next.disabled) {
          playClick();
          onSelect(next.id);
        }
      }}
    >
      {options.map((opt, idx) => {
        const isSelected = opt.id === selectedId;
        const isDisabled = !!disabled || !!opt.disabled;
        const className = isDisabled
          ? disabledButton
          : isSelected
            ? selectedButton
            : baseButton;

        return (
          <button
            key={opt.id}
            ref={(el) => {
              buttonRefs.current[idx] = el;
            }}
            id={`${groupId}-${opt.id}`}
            type='button'
            role='radio'
            aria-checked={isSelected}
            aria-disabled={isDisabled}
            tabIndex={idx === selectedIndex ? 0 : -1}
            disabled={isDisabled}
            onMouseEnter={playHover}
            onClick={() => {
              if (isDisabled) return;
              playClick();
              onSelect(opt.id);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${buttonMinHeightClassName ?? ''} ${className}`}
          >
            {opt.icon ? <span aria-hidden='true'>{opt.icon}</span> : null}
            <span className='flex flex-col items-start leading-tight'>
              <span>{opt.label}</span>
              {opt.sublabel ? (
                <span className='text-[11px] opacity-80'>{opt.sublabel}</span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
