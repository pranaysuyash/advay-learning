/**
 * Kenney UI Button Component
 * 
 * Uses sprites from Kenney's UI Pack
 * https://kenney.nl/assets/ui-pack
 * 
 * Button Colors: blue, green, red, yellow, grey
 * Styles: default, square, gloss
 */

import { ReactNode } from 'react';

export type KenneyButtonColor = 'blue' | 'green' | 'red' | 'yellow' | 'grey';
export type KenneyButtonSize = 'small' | 'default' | 'large';
export type KenneyButtonStyle = 'default' | 'square' | 'gloss';

interface KenneyButtonProps {
  children: ReactNode;
  color?: KenneyButtonColor;
  size?: KenneyButtonSize;
  style?: KenneyButtonStyle;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Kenney UI Button
 * 
 * Maps to Kenney UI Pack sprites:
 * - button_[color].png - Default flat button
 * - button_[color]_square.png - Square button
 * - button_[color]_gloss.png - Glossy button
 */
export function KenneyButton({
  children,
  color = 'blue',
  size = 'default',
  style = 'default',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}: KenneyButtonProps) {
  // Build the sprite path
  const getSpritePath = () => {
    const basePath = '/assets/kenney/ui/buttons';
    const styleSuffix = style === 'square' ? '_square' : style === 'gloss' ? '_gloss' : '';
    return `${basePath}/button_${color}${styleSuffix}.png`;
  };

  // Size classes for text and padding
  const sizeClasses = {
    small: 'text-sm px-3 py-1 min-h-[32px]',
    default: 'text-base px-6 py-2 min-h-[48px]',
    large: 'text-lg px-8 py-3 min-h-[64px]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative font-bold text-white
        transition-transform active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        backgroundImage: `url(${getSpritePath()})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        border: 'none',
        backgroundColor: 'transparent',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }}
    >
      {children}
    </button>
  );
}

/**
 * Kenney UI Panel
 *
 * Background panels from UI Pack.
 * @deprecated No consumers found — scheduled for removal in a dedicated cleanup commit.
 */
interface KenneyPanelProps {
  children: ReactNode;
  variant?: 'default' | 'blue' | 'green' | 'red' | 'yellow';
  className?: string;
}

export function KenneyPanel({
  children,
  variant = 'default',
  className = '',
}: KenneyPanelProps) {
  const color = variant === 'default' ? 'grey' : variant;
  return (
    <div
      className={`p-6 rounded-2xl bg-gray-100 ${className}`}
      data-kenney-panel={color}
    >
      {children}
    </div>
  );
}

/**
 * Kenney UI Progress Bar
 *
 * Uses 9-slice scaling for smooth progress bars
 */
interface KenneyProgressBarProps {
  progress: number; // 0-100
  color?: 'blue' | 'green' | 'red' | 'yellow';
  className?: string;
}

export function KenneyProgressBar({
  progress,
  color = 'blue',
  className = '',
}: KenneyProgressBarProps) {
  const colorCapitalized = color.charAt(0).toUpperCase() + color.slice(1);
  
  return (
    <div className={`relative h-8 ${className}`}>
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(/assets/kenney/ui/progress/barBack_horizontalLeft.png), url(/assets/kenney/ui/progress/barBack_horizontalMid.png), url(/assets/kenney/ui/progress/barBack_horizontalRight.png)`,
          backgroundSize: 'auto 100%, calc(100% - 16px) 100%, auto 100%',
          backgroundPosition: 'left center, 8px center, right center',
          backgroundRepeat: 'no-repeat, repeat-x, no-repeat',
        }}
      />
      {/* Fill */}
      <div
        className="absolute left-1 top-1 bottom-1 transition-all duration-300"
        style={{
          width: `calc(${Math.min(100, Math.max(0, progress))}% - 8px)`,
          backgroundImage: `url(/assets/kenney/ui/progress/bar${colorCapitalized}_horizontalLeft.png), url(/assets/kenney/ui/progress/bar${colorCapitalized}_horizontalMid.png)`,
          backgroundSize: 'auto 100%, 100% 100%',
          backgroundPosition: 'left center, center center',
          backgroundRepeat: 'no-repeat, repeat-x',
        }}
      />
    </div>
  );
}

/**
 * Kenney UI Slider
 *
 * @deprecated Slider assets (`sliderBack.png`, `sliderBlue.png`) are not
 * present in the local Kenney bundle and were not imported with this pack.
 * This component renders broken until those assets are sourced.
 * Use a plain HTML `<input type="range">` or a CSS-based slider instead.
 */
interface KenneySliderProps {
  value: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  className?: string;
}

export function KenneySlider({
  value,
  min = 0,
  max = 100,
  onChange,
  className = '',
}: KenneySliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`relative h-12 ${className}`}>
      {/* Track */}
      <div
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-4"
        style={{
          backgroundImage: 'url(/assets/kenney/ui/progress/sliderBack.png)',
          backgroundSize: '100% 100%',
        }}
      />
      {/* Handle */}
      <button
        className="absolute top-1/2 -translate-y-1/2 w-8 h-8 -ml-4 transition-all active:scale-95"
        style={{
          left: `${percentage}%`,
          backgroundImage: 'url(/assets/kenney/ui/progress/sliderBlue.png)',
          backgroundSize: '100% 100%',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
        }}
        onClick={() => {}}
      />
      {/* Invisible range input for accessibility */}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Slider"
      />
    </div>
  );
}

export default KenneyButton;
