import { useId, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';

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

  const selectedIndex = useMemo(() => {
    const idx = options.findIndex((opt) => opt.id === selectedId);
    return idx >= 0 ? idx : 0;
  }, [options, selectedId]);

  const baseButton =
    theme === 'dark'
      ? 'bg-black/35 text-white border border-white/20 hover:bg-black/45'
      : 'bg-bg-tertiary text-text-primary border border-border hover:bg-white';
  const selectedButton =
    theme === 'dark'
      ? 'bg-white text-advay-slate border border-white shadow-soft'
      : 'bg-pip-orange text-white shadow-soft border border-pip-orange';
  const disabledButton =
    theme === 'dark'
      ? 'bg-black/20 text-white/50 border border-white/10 cursor-not-allowed'
      : 'bg-bg-tertiary text-text-secondary border border-border cursor-not-allowed opacity-60';

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
        if (!disabled && !next.disabled) onSelect(next.id);
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
            onClick={() => {
              if (isDisabled) return;
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
