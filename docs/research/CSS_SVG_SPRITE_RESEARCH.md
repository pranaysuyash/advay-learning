# CSS/SVG Sprite Creation Guide for Children's Games

**Date:** 2026-02-23  
**Purpose:** Comprehensive guide for creating 2D game characters using CSS and SVG

---

## 1. CSS-Only Character Creation

### 1.1 The Blob Monster Pattern

```css
/* Base monster shape */
.monster {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, var(--monster-color) 0%, var(--monster-dark) 100%);
  border-radius: 50%;
  position: relative;
  box-shadow: 
    0 8px 20px rgba(0,0,0,0.2),
    inset -10px -10px 20px rgba(0,0,0,0.1),
    inset 10px 10px 20px rgba(255,255,255,0.2);
}

/* Eyes using pseudo-elements */
.monster::before,
.monster::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 32px;
  background: white;
  border-radius: 50%;
  top: 35px;
  box-shadow: inset 0 3px 5px rgba(0,0,0,0.1);
}

.monster::before {
  left: 28px;
}

.monster::after {
  right: 28px;
}

/* Pupils */
.monster-eye {
  position: absolute;
  width: 12px;
  height: 16px;
  background: #1a1a2e;
  border-radius: 50%;
  top: 42px;
  z-index: 1;
  transition: transform 0.2s ease;
}

.monster-eye.left { left: 34px; }
.monster-eye.right { right: 34px; }

/* Mouth */
.monster-mouth {
  position: absolute;
  width: 40px;
  height: 20px;
  background: #1a1a2e;
  border-radius: 0 0 40px 40px;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  transition: all 0.3s ease;
}

/* Expression variants */
.monster.happy .monster-mouth {
  height: 25px;
  border-radius: 0 0 40px 40px;
  background: linear-gradient(to bottom, #1a1a2e 60%, #e74c3c 60%);
}

.monster.surprised .monster-mouth {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #1a1a2e;
}

.monster.sad .monster-mouth {
  border-radius: 40px 40px 0 0;
  background: #1a1a2e;
}
```

### 1.2 Animation Keyframes

```css
/* Idle breathing animation */
@keyframes breathe {
  0%, 100% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.02) translateY(-3px); }
}

.monster.idle {
  animation: breathe 3s ease-in-out infinite;
}

/* Happy bounce */
@keyframes happy-bounce {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-5deg); }
  50% { transform: scale(1.1) translateY(-20px) rotate(5deg); }
  75% { transform: scale(1.1) rotate(-3deg); }
}

.monster.celebrating {
  animation: happy-bounce 0.8s ease-in-out;
}

/* Shake (incorrect answer) */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-10px) rotate(-5deg); }
  40% { transform: translateX(10px) rotate(5deg); }
  60% { transform: translateX(-10px) rotate(-3deg); }
  80% { transform: translateX(10px) rotate(3deg); }
}

.monster.shaking {
  animation: shake 0.5s ease-in-out;
}

/* Eating animation */
@keyframes munch {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.monster.eating {
  animation: munch 0.3s ease-in-out 3;
}

/* Wiggle */
@keyframes wiggle {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

.monster.wiggling {
  animation: wiggle 0.5s ease-in-out infinite;
}
```

### 1.3 React Component

```tsx
import React, { useState, useEffect } from 'react';
import './Monster.css';

type MonsterExpression = 'idle' | 'happy' | 'sad' | 'surprised' | 'eating' | 'shaking';
type MonsterColor = 'green' | 'blue' | 'purple' | 'orange' | 'red';

interface MonsterProps {
  color: MonsterColor;
  expression: MonsterExpression;
  size?: 'sm' | 'md' | 'lg';
  eyeTracking?: boolean;
  onClick?: () => void;
}

const colorMap: Record<MonsterColor, string> = {
  green: '#4ade80',
  blue: '#60a5fa',
  purple: '#c084fc',
  orange: '#fb923c',
  red: '#f87171',
};

export const CSSMonster: React.FC<MonsterProps> = ({
  color,
  expression,
  size = 'md',
  eyeTracking = true,
  onClick,
}) => {
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    if (!eyeTracking) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = document.getElementById('monster')?.getBoundingClientRect();
      if (!rect) return;
      
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const maxOffset = 6;
      const x = Math.min(maxOffset, Math.max(-maxOffset, (e.clientX - centerX) / 20));
      const y = Math.min(maxOffset, Math.max(-maxOffset, (e.clientY - centerY) / 20));
      
      setPupilOffset({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [eyeTracking]);
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };
  
  return (
    <div
      id="monster"
      className={`monster ${expression} ${sizeClasses[size]}`}
      style={{ 
        '--monster-color': colorMap[color],
        '--monster-dark': `${colorMap[color]}dd`,
      } as React.CSSProperties}
      onClick={onClick}
    >
      <div 
        className="monster-eye left"
        style={{ transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` }}
      />
      <div 
        className="monster-eye right"
        style={{ transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` }}
      />
      <div className="monster-mouth" />
    </div>
  );
};
```

---

## 2. SVG Sprite Sheets

### 2.1 Why SVG Sprite Sheets?

**Advantages:**
- Single HTTP request for all character states
- Vector scaling (crisp at any size)
- CSS styling of SVG elements
- Smaller than multiple PNGs

**Structure:**
```svg
<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
  <defs>
    <!-- Monster Base Shape -->
    <g id="monster-body">
      <circle cx="60" cy="60" r="50" fill="url(#body-gradient)"/>
    </g>
    
    <!-- Eye Happy -->
    <g id="eye-happy">
      <ellipse cx="0" cy="0" rx="10" ry="12" fill="white"/>
      <circle cx="0" cy="2" r="5" fill="#1a1a2e"/>
    </g>
    
    <!-- Eye Sad -->
    <g id="eye-sad">
      <path d="M-10,0 Q0,-8 10,0 Q0,8 -10,0" fill="white"/>
      <circle cx="0" cy="2" r="4" fill="#1a1a2e"/>
    </g>
    
    <!-- Mouth Happy -->
    <g id="mouth-happy">
      <path d="M-20,0 Q0,20 20,0" fill="#1a1a2e"/>
      <path d="M-15,5 Q0,15 15,5" fill="#e74c3c"/>
    </g>
    
    <!-- Complete Characters -->
    <g id="monster-idle">
      <use href="#monster-body"/>
      <use href="#eye-happy" x="35" y="45"/>
      <use href="#eye-happy" x="85" y="45"/>
      <use href="#mouth-happy" x="60" y="70"/>
    </g>
    
    <g id="monster-sad">
      <use href="#monster-body"/>
      <use href="#eye-sad" x="35" y="50"/>
      <use href="#eye-sad" x="85" y="50"/>
      <path d="M-15,0 Q0,-10 15,0" transform="translate(60,80)" fill="#1a1a2e"/>
    </g>
  </defs>
</svg>
```

### 2.2 React SVG Sprite Component

```tsx
import React from 'react';

// SVG Sprite sheet embedded or loaded
const MONSTER_SPRITE_SHEET = `/assets/sprites/monsters.svg`;

type MonsterVariant = 'idle' | 'happy' | 'sad' | 'surprised' | 'eating';
type MonsterColor = 'green' | 'blue' | 'purple' | 'orange';

interface SVGMonsterProps {
  variant: MonsterVariant;
  color: MonsterColor;
  size?: number;
  className?: string;
}

const colorFilters: Record<MonsterColor, string> = {
  green: 'hue-rotate(90deg)',
  blue: 'hue-rotate(180deg)',
  purple: 'hue-rotate(270deg)',
  orange: 'hue-rotate(30deg)',
};

export const SVGMonster: React.FC<SVGMonsterProps> = ({
  variant,
  color,
  size = 120,
  className,
}) => {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      style={{ filter: colorFilters[color] }}
    >
      <use href={`${MONSTER_SPRITE_SHEET}#monster-${variant}`} />
    </svg>
  );
};
```

### 2.3 Inline SVG (No External File)

```tsx
import React from 'react';

interface InlineMonsterProps {
  expression: 'happy' | 'sad' | 'surprised';
  color: string;
  size?: number;
}

export const InlineMonster: React.FC<InlineMonsterProps> = ({
  expression,
  color,
  size = 100,
}) => {
  const mouthPaths = {
    happy: 'M30,60 Q50,80 70,60',
    sad: 'M30,70 Q50,50 70,70',
    surprised: 'M40,60 A10,10 0 1,1 60,60 A10,10 0 1,1 40,60',
  };
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id="bodyGradient" cx="30%" cy="30%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </radialGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.2"/>
        </filter>
      </defs>
      
      {/* Body */}
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill="url(#bodyGradient)"
        filter="url(#shadow)"
      />
      
      {/* Eyes */}
      <ellipse cx="35" cy="40" rx="10" ry="12" fill="white"/>
      <ellipse cx="65" cy="40" rx="10" ry="12" fill="white"/>
      <circle cx="35" cy="43" r="5" fill="#1a1a2e"/>
      <circle cx="65" cy="43" r="5" fill="#1a1a2e"/>
      
      {/* Mouth */}
      <path
        d={mouthPaths[expression]}
        fill="none"
        stroke="#1a1a2e"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
};
```

---

## 3. Comparison: CSS vs SVG vs Canvas

| Feature | CSS Only | SVG | Canvas | Recommendation |
|---------|----------|-----|--------|----------------|
| **Complexity** | Simple shapes | Moderate | Complex | CSS for simple, SVG for detailed |
| **File Size** | ~2KB | ~5KB | ~1KB + JS | CSS wins for simple |
| **Scalability** | Good | Perfect | Good | SVG for responsive |
| **Animations** | Excellent | Good | Manual | CSS for UI, SVG for characters |
| **Interactivity** | Limited | Good | Excellent | SVG for clickable elements |
| **Mobile Perf** | Excellent | Excellent | Good | All viable |
| **Learning Curve** | Low | Medium | High | Start with CSS |

---

## 4. Best Practices for Children's Games

### 4.1 Design Principles

1. **Simplicity:** Use 3-5 colors maximum per character
2. **Contrast:** Ensure high contrast for visibility
3. **Expressions:** Exaggerate emotions (big smiles, wide eyes)
4. **Consistency:** Same style across all characters
5. **Accessibility:** Minimum 4.5:1 contrast ratio

### 4.2 File Organization

```
src/
├── components/
│   └── characters/
│       ├── CSSMonster.tsx
│       ├── SVGMonster.tsx
│       ├── index.ts
│       └── styles/
│           ├── monster-base.css
│           ├── monster-animations.css
│           └── monster-variants.css
├── assets/
│   └── sprites/
│       ├── monsters.svg
│       ├── animals.svg
│       └── ui-elements.svg
```

### 4.3 Performance Tips

```css
/* Use transform instead of position for animations */
.monster {
  /* Good - GPU accelerated */
  transform: translateX(100px);
  
  /* Bad - triggers reflow */
  left: 100px;
}

/* Use will-change sparingly */
.monster.animating {
  will-change: transform;
}

/* Batch animations */
.monster-group {
  /* Animate container, not each child */
  transform: translateY(-10px);
}
```

---

## 5. Complete Monster Set (CSS)

```scss
// _monsters.scss

@mixin monster-base($color) {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, $color 0%, darken($color, 10%) 100%);
  border-radius: 50%;
  position: relative;
  transition: transform 0.3s ease;
  
  &::before, &::after {
    content: '';
    position: absolute;
    background: white;
    border-radius: 50%;
  }
}

// Munchy - Green, hungry
.monster-munchy {
  @include monster-base(#4ade80);
  
  &::before, &::after {
    width: 20px;
    height: 25px;
    top: 35px;
  }
  
  &::before { left: 30px; }
  &::after { right: 30px; }
}

// Crunchy - Blue, grumpy
.monster-crunchy {
  @include monster-base(#60a5fa);
  
  // Angry eyebrows
  .eyebrow {
    position: absolute;
    width: 25px;
    height: 5px;
    background: #1a1a2e;
    top: 30px;
    
    &.left { 
      left: 25px; 
      transform: rotate(20deg);
    }
    &.right { 
      right: 25px; 
      transform: rotate(-20deg);
    }
  }
}

// Nibbles - Purple, playful
.monster-nibbles {
  @include monster-base(#c084fc);
  
  // Sparkles around head
  .sparkle {
    position: absolute;
    width: 10px;
    height: 10px;
    background: white;
    border-radius: 50%;
    animation: sparkle 1.5s ease-in-out infinite;
  }
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}
```

---

## 6. Integration with Existing Games

### 6.1 Math Monsters Migration Plan

```tsx
// Before (emoji-based)
<div className="text-9xl">🦖</div>

// After (CSS monster)
<CSSMonster 
  color="green" 
  expression={isCorrect ? 'happy' : 'sad'}
  size="lg"
  eyeTracking={true}
/>
```

### 6.2 Animation Triggers

```tsx
const [animation, setAnimation] = useState('idle');

const handleCorrectAnswer = () => {
  setAnimation('celebrating');
  setTimeout(() => setAnimation('idle'), 800);
};

const handleWrongAnswer = () => {
  setAnimation('shaking');
  setTimeout(() => setAnimation('idle'), 500);
};
```

---

## 7. Tools and Resources

### 7.1 Creation Tools

1. **Figma** - Design, export SVG
2. **SVGOMG** - Optimize SVG files (svgomg.net)
3. **Boxy SVG** - Browser-based SVG editor
4. **CSS Gradient Generator** - cssgradient.io

### 7.2 Animation Tools

1. **Animista** - CSS animation presets (animista.net)
2. **keyframes.app** - Visual CSS animation editor
3. **SVGator** - SVG animation tool

---

## 8. Migration Checklist

- [ ] Design base monster component in CSS
- [ ] Create 5 expression variants
- [ ] Implement all animation states
- [ ] Test on mobile devices
- [ ] Ensure 60fps animations
- [ ] Add eye-tracking option
- [ ] Create color variants for each monster
- [ ] Document component API
- [ ] Replace emojis in Math Monsters
- [ ] Test accessibility (screen readers)

---

*Next: Implement CSS Monster component and migrate Math Monsters*
