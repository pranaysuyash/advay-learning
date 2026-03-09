/**
 * Emoji to Kenney Asset Mapping Utility
 * 
 * Provides systematic conversion from emoji to Kenney game assets.
 * Use this utility when replacing emoji usage throughout the codebase.
 * 
 * @see docs/audit/KENNEY_ASSET_AUDIT_COMPLETE.md
 * @see src/components/ui/KenneyIcon.tsx
 */

import type { KenneyIconType } from '../components/ui/KenneyIcon';

/**
 * Mapping from common emojis to Kenney icon types
 */
export const EMOJI_TO_KENNEY: Record<string, KenneyIconType> = {
  // Hearts / Lives
  '❤️': 'heart',
  '💛': 'heart',
  '💚': 'heart',
  '💙': 'heart',
  '💜': 'heart',
  '🧡': 'heart',
  '🖤': 'heart',
  '🤍': 'heart_empty',
  '💔': 'heart_half',
  
  // Currency / Collectibles
  '🪙': 'coin',
  '💰': 'coin',
  '💎': 'gem',
  '⭐': 'star',
  '🌟': 'star',
  '✨': 'star',
  
  // Keys
  '🔑': 'key_yellow',
  '🗝️': 'key_yellow',
  
  // Locks
  '🔒': 'lock_blue',
  '🔓': 'lock_blue',
  '🔐': 'lock_blue',
  
  // Check / Cross
  '✅': 'check',
  '✓': 'check',
  '☑️': 'check',
  '❌': 'cross',
  '✕': 'cross',
  '✖️': 'cross',
  '⭕': 'circle',
  '🔴': 'circle',
  '🟢': 'circle',
  '🔵': 'circle',
  '🟡': 'circle',
};

/**
 * Get the Kenney icon type for a given emoji
 * 
 * @param emoji - The emoji string
 * @returns The KenneyIconType or undefined if no mapping exists
 * 
 * @example
 * ```ts
 * const iconType = getKenneyIconForEmoji('❤️'); // 'heart'
 * ```
 */
export function getKenneyIconForEmoji(emoji: string): KenneyIconType | undefined {
  return EMOJI_TO_KENNEY[emoji];
}

/**
 * Check if an emoji has a Kenney asset equivalent
 * 
 * @param emoji - The emoji string
 * @returns True if a mapping exists
 */
export function hasKenneyEquivalent(emoji: string): boolean {
  return emoji in EMOJI_TO_KENNEY;
}

/**
 * Convert text with emojis to use Kenney assets
 * 
 * @param text - Text that may contain emojis
 * @returns Object with text and extracted icon types
 * 
 * @example
 * ```ts
 * const result = convertEmojisToKenney('Score: ⭐ 100');
 * // { text: 'Score: 100', icons: [{ type: 'star', position: 7 }] }
 * ```
 */
export function convertEmojisToKenney(text: string): {
  text: string;
  icons: Array<{ type: KenneyIconType; position: number }>;
} {
  const icons: Array<{ type: KenneyIconType; position: number }> = [];
  let cleanText = text;
  let offset = 0;

  // Find all emojis in the text
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE0F}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F171}]|[\u{1F17E}-\u{1F17F}]|[\u{1F18E}]|[\u{3030}]|[\u{2B50}]|[\u{2B55}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{3297}]|[\u{3299}]|[\u{303D}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]/gu;

  let match;
  while ((match = emojiRegex.exec(text)) !== null) {
    const emoji = match[0];
    const position = match.index - offset;
    const kenneyType = getKenneyIconForEmoji(emoji);
    
    if (kenneyType) {
      icons.push({ type: kenneyType, position });
      // Remove emoji from text
      cleanText = cleanText.replace(emoji, '');
      offset += emoji.length;
    }
  }

  return { text: cleanText.trim(), icons };
}

/**
 * Batch replacement helper for file content
 * 
 * @param content - File content string
 * @returns Object with updated content and replacement report
 */
export function batchReplaceEmojis(content: string): {
  content: string;
  replacements: Array<{ from: string; to: string; line: number }>;
  unmapped: Array<{ emoji: string; line: number; context: string }>;
} {
  const replacements: Array<{ from: string; to: string; line: number }> = [];
  const unmapped: Array<{ emoji: string; line: number; context: string }> = [];
  
  const lines = content.split('\n');
  const processedLines = lines.map((line, index) => {
    const lineNum = index + 1;
    let processedLine = line;
    
    // Find emojis in the line
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE0F}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F171}]|[\u{1F17E}-\u{1F17F}]|[\u{1F18E}]|[\u{3030}]|[\u{2B50}]|[\u{2B55}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{3297}]|[\u{3299}]|[\u{303D}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]/gu;
    
    let match;
    while ((match = emojiRegex.exec(line)) !== null) {
      const emoji = match[0];
      const kenneyType = getKenneyIconForEmoji(emoji);
      
      if (kenneyType) {
        // Simple string replacement - in real usage, you'd import and use KenneyIcon
        const replacement = `{/* TODO: Replace with <KenneyIcon type="${kenneyType}" /> */}${emoji}`;
        processedLine = processedLine.replace(emoji, replacement);
        replacements.push({ from: emoji, to: kenneyType, line: lineNum });
      } else {
        // Get context around unmapped emoji
        const contextStart = Math.max(0, match.index - 20);
        const contextEnd = Math.min(line.length, match.index + 20);
        const context = line.slice(contextStart, contextEnd);
        unmapped.push({ emoji, line: lineNum, context });
      }
    }
    
    return processedLine;
  });
  
  return {
    content: processedLines.join('\n'),
    replacements,
    unmapped
  };
}

/**
 * Generate a report of emoji usage in a file
 * 
 * @param content - File content
 * @returns Report of emoji usage
 */
export function generateEmojiReport(content: string, filename: string = 'unknown'): string {
  const lines = content.split('\n');
  const foundEmojis: Array<{ emoji: string; line: number; context: string; hasMapping: boolean }> = [];
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE0F}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F171}]|[\u{1F17E}-\u{1F17F}]|[\u{1F18E}]|[\u{3030}]|[\u{2B50}]|[\u{2B55}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{3297}]|[\u{3299}]|[\u{303D}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]/gu;
    
    let match;
    while ((match = emojiRegex.exec(line)) !== null) {
      const emoji = match[0];
      const contextStart = Math.max(0, match.index - 30);
      const contextEnd = Math.min(line.length, match.index + 30);
      const context = line.slice(contextStart, contextEnd);
      
      foundEmojis.push({
        emoji,
        line: lineNum,
        context,
        hasMapping: hasKenneyEquivalent(emoji)
      });
    }
  });
  
  if (foundEmojis.length === 0) {
    return `No emojis found in ${filename}`;
  }
  
  const mapped = foundEmojis.filter(e => e.hasMapping);
  const unmapped = foundEmojis.filter(e => !e.hasMapping);
  
  let report = `# Emoji Report: ${filename}\n\n`;
  report += `Total emojis found: ${foundEmojis.length}\n`;
  report += `- With Kenney mapping: ${mapped.length}\n`;
  report += `- Without mapping: ${unmapped.length}\n\n`;
  
  if (mapped.length > 0) {
    report += `## Replaceable Emojis\n\n`;
    mapped.forEach(e => {
      const kenneyType = getKenneyIconForEmoji(e.emoji);
      report += `- Line ${e.line}: "${e.emoji}" → <KenneyIcon type="${kenneyType}" />\n`;
      report += `  Context: ${e.context}\n\n`;
    });
  }
  
  if (unmapped.length > 0) {
    report += `## Unmapped Emojis (Manual Review Needed)\n\n`;
    unmapped.forEach(e => {
      report += `- Line ${e.line}: "${e.emoji}"\n`;
      report += `  Context: ${e.context}\n\n`;
    });
  }
  
  return report;
}

export default {
  EMOJI_TO_KENNEY,
  getKenneyIconForEmoji,
  hasKenneyEquivalent,
  convertEmojisToKenney,
  batchReplaceEmojis,
  generateEmojiReport,
};
