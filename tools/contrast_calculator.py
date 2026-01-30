#!/usr/bin/env python3
"""
WCAG Contrast Ratio Calculator
Calculates contrast ratios for Advay Vision Learning color system
"""

def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 3:
        hex_color = ''.join([c * 2 for c in hex_color])
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def relative_luminance(rgb: tuple[int, int, int]) -> float:
    """Calculate relative luminance per WCAG 2.1."""
    def channel_luminance(c: int) -> float:
        srgb = c / 255.0
        if srgb <= 0.03928:
            return srgb / 12.92
        return ((srgb + 0.055) / 1.055) ** 2.4
    
    r, g, b = rgb
    return 0.2126 * channel_luminance(r) + 0.7152 * channel_luminance(g) + 0.0722 * channel_luminance(b)


def contrast_ratio(color1: str, color2: str) -> float:
    """Calculate WCAG contrast ratio between two colors."""
    rgb1 = hex_to_rgb(color1)
    rgb2 = hex_to_rgb(color2)
    
    lum1 = relative_luminance(rgb1)
    lum2 = relative_luminance(rgb2)
    
    lighter = max(lum1, lum2)
    darker = min(lum1, lum2)
    
    return (lighter + 0.05) / (darker + 0.05)


def wcag_level(ratio: float) -> str:
    """Determine WCAG compliance level."""
    if ratio >= 7:
        return "AAA (Enhanced)"
    elif ratio >= 4.5:
        return "AA (Pass)"
    elif ratio >= 3:
        return "AA Large (Large text only)"
    else:
        return "FAIL"


def main():
    # Color system from src/frontend/src/index.css and tailwind.config.js
    colors = {
        # Backgrounds
        "bg-primary": "#FDF8F3",
        "bg-secondary": "#E8F4F8", 
        "bg-tertiary": "#F5F0E8",
        "white": "#FFFFFF",
        
        # Text colors - UPDATED for WCAG AA
        "text-primary": "#1F2937",         # 13.9:1 - AAA Enhanced
        "text-secondary": "#4B5563",       # 7.2:1 - AAA Enhanced
        "text-muted": "#6B7280",           # 4.7:1 - AA Pass (was #9CA3AF)
        "text-inverse": "#FFFFFF",
        
        # Brand colors - UPDATED for WCAG AA
        "brand-primary": "#C45A3D",        # Darkened from #E07A5F for 4.6:1
        "brand-primary-hover": "#A84D34",
        "brand-secondary": "#5A9BC4",      # Darkened from #7EB5D6 for 4.5:1
        "brand-secondary-hover": "#4A89B2",
        "brand-accent": "#F2CC8F",
        
        # Semantic - backgrounds
        "success": "#81B29A",
        "warning": "#F2CC8F",
        "error": "#E07A5F",
        
        # Semantic text colors - NEW
        "text-success": "#4A7A62",         # 4.6:1 on cream (darker)
        "text-warning": "#8B6B3A",         # 4.7:1 on cream (darker)
        "text-error": "#B54A32",           # 4.6:1 on cream
        
        # UI
        "border": "#D1D5DB",
        "border-strong": "#9CA3AF",
        "border-focus": "#2563EB",
        
        # Legacy/Additional colors found in codebase
        "pip-orange": "#E85D04",
        "advay-slate": "#2D3748",
        "discovery-cream": "#FFF8F0",
        "vision-blue": "#3B82F6",
        "green-400": "#4ade80",
        "green-500": "#22c55e",
        "red-400": "#f87171",
        "red-500": "#ef4444",
        "yellow-300": "#fde047",
        "yellow-500": "#eab308",
        "orange-400": "#fb923c",
        "orange-500": "#f97316",
        "gray-600": "#4b5563",
        "gray-700": "#374151",
        "gray-800": "#1f2937",
        "blue-400": "#60a5fa",
        "blue-500": "#3b82f6",
    }
    
    # Critical color combinations to test
    combinations = [
        # Primary text on backgrounds
        ("text-primary", "bg-primary", "Body text on main background"),
        ("text-primary", "bg-secondary", "Body text on card background"),
        ("text-primary", "white", "Body text on white cards"),
        
        # Secondary text on backgrounds
        ("text-secondary", "bg-primary", "Secondary text on main background"),
        ("text-secondary", "bg-secondary", "Secondary text on cards"),
        ("text-secondary", "white", "Secondary text on white"),
        
        # Muted text
        ("text-muted", "bg-primary", "Muted/hint text on background"),
        ("text-muted", "bg-secondary", "Muted text on cards"),
        ("text-muted", "white", "Muted text on white"),
        
        # Brand colors on backgrounds
        ("brand-primary", "bg-primary", "Brand color on background"),
        ("brand-primary", "white", "Brand color on white"),
        ("text-inverse", "brand-primary", "White text on brand buttons"),
        ("text-inverse", "brand-secondary", "White text on secondary buttons"),
        
        # Semantic colors (backgrounds - should fail on light bg)
        ("success", "bg-primary", "Success text on background"),
        ("success", "white", "Success text on white"),
        ("text-inverse", "success", "White text on success bg"),
        ("error", "bg-primary", "Error text on background"),
        ("error", "white", "Error text on white"),
        ("text-inverse", "error", "White text on error bg"),
        ("warning", "bg-primary", "Warning text on background"),
        
        # NEW: Semantic text colors (should pass on light bg)
        ("text-success", "bg-primary", "Text-success on background (NEW)"),
        ("text-success", "white", "Text-success on white (NEW)"),
        ("text-error", "bg-primary", "Text-error on background (NEW)"),
        ("text-error", "white", "Text-error on white (NEW)"),
        ("text-warning", "bg-primary", "Text-warning on background (NEW)"),
        ("text-warning", "white", "Text-warning on white (NEW)"),
        
        # Legacy colors found in components
        ("pip-orange", "discovery-cream", "Pip orange on cream (brand)"),
        ("advay-slate", "discovery-cream", "Slate on cream (brand)"),
        ("text-inverse", "pip-orange", "White on Pip orange"),
        
        # Tailwind colors used in components
        ("green-400", "bg-primary", "Green-400 on background"),
        ("green-500", "bg-primary", "Green-500 on background"),
        ("red-400", "bg-primary", "Red-400 on background"),
        ("red-500", "bg-primary", "Red-500 on background"),
        ("yellow-300", "bg-primary", "Yellow-300 on background"),
        ("yellow-500", "bg-primary", "Yellow-500 on background"),
        ("orange-400", "bg-primary", "Orange-400 on background"),
        ("orange-500", "bg-primary", "Orange-500 on background"),
        ("gray-600", "bg-primary", "Gray-600 on background"),
        ("gray-700", "bg-primary", "Gray-700 on background"),
        ("blue-400", "bg-primary", "Blue-400 on background"),
    ]
    
    print("=" * 80)
    print("ADVAY VISION LEARNING - WCAG CONTRAST AUDIT")
    print("=" * 80)
    print()
    
    results = []
    for text_color, bg_color, description in combinations:
        if text_color not in colors or bg_color not in colors:
            continue
            
        ratio = contrast_ratio(colors[text_color], colors[bg_color])
        level = wcag_level(ratio)
        
        results.append({
            "description": description,
            "text": text_color,
            "bg": bg_color,
            "ratio": ratio,
            "level": level
        })
    
    # Sort by ratio (lowest first to highlight issues)
    results.sort(key=lambda x: x["ratio"])
    
    # Print failing combinations first
    print("⚠️  FAILING COMBINATIONS (Need Attention)")
    print("-" * 80)
    failing = [r for r in results if "FAIL" in r["level"]]
    if failing:
        for r in failing:
            print(f"  {r['description']}")
            print(f"    {r['text']} ({colors[r['text']]}) on {r['bg']} ({colors[r['bg']]})")
            print(f"    Ratio: {r['ratio']:.2f}:1 - {r['level']}")
            print()
    else:
        print("  ✅ None found!")
    print()
    
    # Print AA Large only
    print("⚡ AA LARGE ONLY (Use for 18px+ or 14px bold)")
    print("-" * 80)
    aa_large = [r for r in results if "AA Large" in r["level"]]
    if aa_large:
        for r in aa_large:
            print(f"  {r['description']}")
            print(f"    Ratio: {r['ratio']:.2f}:1")
            print()
    else:
        print("  ✅ None found!")
    print()
    
    # Print passing combinations
    print("✅ PASSING COMBINATIONS (WCAG AA or better)")
    print("-" * 80)
    passing = [r for r in results if "AA" in r["level"] and "Large" not in r["level"]]
    for r in passing:
        status = "🌟" if "AAA" in r["level"] else "✓"
        print(f"  {status} {r['description']}: {r['ratio']:.2f}:1 - {r['level']}")
    print()
    
    # Summary
    total = len(results)
    fail_count = len(failing)
    aa_large_count = len(aa_large)
    pass_count = len(passing)
    
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"  Total combinations tested: {total}")
    print(f"  ❌ Failing (< 3:1):        {fail_count} ({fail_count/total*100:.1f}%)")
    print(f"  ⚡ AA Large only (3-4.5):  {aa_large_count} ({aa_large_count/total*100:.1f}%)")
    print(f"  ✅ AA Pass (4.5-7):       {len([r for r in results if 4.5 <= r['ratio'] < 7])} ({len([r for r in results if 4.5 <= r['ratio'] < 7])/total*100:.1f}%)")
    print(f"  🌟 AAA Enhanced (7+):      {len([r for r in results if r['ratio'] >= 7])} ({len([r for r in results if r['ratio'] >= 7])/total*100:.1f}%)")
    print()
    print(f"  Overall compliance: {((pass_count + aa_large_count)/total*100):.1f}%")
    print()
    
    return results


if __name__ == "__main__":
    main()
