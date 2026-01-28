// Multi-language alphabet data for learning games

export interface Letter {
  char: string;
  name: string;
  emoji: string;
  color: string;
  transliteration?: string;
  pronunciation?: string;
}

export interface Alphabet {
  language: string;
  name: string;
  letters: Letter[];
}

// English Alphabet
export const englishAlphabet: Alphabet = {
  language: 'english',
  name: 'English',
  letters: [
    { char: 'A', name: 'Apple', emoji: '🍎', color: '#ef4444', pronunciation: 'ay' },
    { char: 'B', name: 'Ball', emoji: '⚽', color: '#3b82f6', pronunciation: 'bee' },
    { char: 'C', name: 'Cat', emoji: '🐱', color: '#f59e0b', pronunciation: 'see' },
    { char: 'D', name: 'Dog', emoji: '🐕', color: '#10b981', pronunciation: 'dee' },
    { char: 'E', name: 'Elephant', emoji: '🐘', color: '#8b5cf6', pronunciation: 'ee' },
    { char: 'F', name: 'Fish', emoji: '🐟', color: '#06b6d4', pronunciation: 'ef' },
    { char: 'G', name: 'Grapes', emoji: '🍇', color: '#84cc16', pronunciation: 'jee' },
    { char: 'H', name: 'House', emoji: '🏠', color: '#f97316', pronunciation: 'aych' },
    { char: 'I', name: 'Ice cream', emoji: '🍦', color: '#ec4899', pronunciation: 'eye' },
    { char: 'J', name: 'Juice', emoji: '🧃', color: '#eab308', pronunciation: 'jay' },
    { char: 'K', name: 'Kite', emoji: '🪁', color: '#6366f1', pronunciation: 'kay' },
    { char: 'L', name: 'Lion', emoji: '🦁', color: '#f59e0b', pronunciation: 'el' },
    { char: 'M', name: 'Moon', emoji: '🌙', color: '#64748b', pronunciation: 'em' },
    { char: 'N', name: 'Nest', emoji: '🪺', color: '#a16207', pronunciation: 'en' },
    { char: 'O', name: 'Orange', emoji: '🍊', color: '#f97316', pronunciation: 'oh' },
    { char: 'P', name: 'Pencil', emoji: '✏️', color: '#eab308', pronunciation: 'pee' },
    { char: 'Q', name: 'Queen', emoji: '👸', color: '#a855f7', pronunciation: 'cue' },
    { char: 'R', name: 'Rainbow', emoji: '🌈', color: '#ec4899', pronunciation: 'ar' },
    { char: 'S', name: 'Sun', emoji: '☀️', color: '#eab308', pronunciation: 'ess' },
    { char: 'T', name: 'Tree', emoji: '🌳', color: '#16a34a', pronunciation: 'tee' },
    { char: 'U', name: 'Umbrella', emoji: '☂️', color: '#3b82f6', pronunciation: 'you' },
    { char: 'V', name: 'Violin', emoji: '🎻', color: '#8b5cf6', pronunciation: 'vee' },
    { char: 'W', name: 'Watermelon', emoji: '🍉', color: '#ef4444', pronunciation: 'double-you' },
    { char: 'X', name: 'Xylophone', emoji: '🎹', color: '#f59e0b', pronunciation: 'ex' },
    { char: 'Y', name: 'Yacht', emoji: '⛵', color: '#06b6d4', pronunciation: 'why' },
    { char: 'Z', name: 'Zebra', emoji: '🦓', color: '#1f2937', pronunciation: 'zee' },
  ],
};

// Hindi Alphabet (Swar - Vowels and Vyanjan - Consonants)
export const hindiAlphabet: Alphabet = {
  language: 'hindi',
  name: 'हिन्दी (Hindi)',
  letters: [
    // Swar (Vowels)
    { char: 'अ', name: 'अनार', emoji: '🍎', color: '#ef4444', transliteration: 'a', pronunciation: 'a as in about' },
    { char: 'आ', name: 'आम', emoji: '🥭', color: '#f59e0b', transliteration: 'aa', pronunciation: 'aa as in father' },
    { char: 'इ', name: 'इमली', emoji: '🌿', color: '#84cc16', transliteration: 'i', pronunciation: 'i as in sit' },
    { char: 'ई', name: 'ईख', emoji: '🎋', color: '#16a34a', transliteration: 'ee', pronunciation: 'ee as in feet' },
    { char: 'उ', name: 'उल्लू', emoji: '🦉', color: '#a16207', transliteration: 'u', pronunciation: 'u as in put' },
    { char: 'ऊ', name: 'ऊन', emoji: '🧶', color: '#f97316', transliteration: 'oo', pronunciation: 'oo as in food' },
    { char: 'ए', name: 'एड़ी', emoji: '🦶', color: '#ec4899', transliteration: 'e', pronunciation: 'e as in bed' },
    { char: 'ऐ', name: 'ऐनक', emoji: '👓', color: '#3b82f6', transliteration: 'ai', pronunciation: 'ai as in fair' },
    { char: 'ओ', name: 'ओखली', emoji: '🥣', color: '#8b5cf6', transliteration: 'o', pronunciation: 'o as in go' },
    { char: 'औ', name: 'औरत', emoji: '👩', color: '#06b6d4', transliteration: 'au', pronunciation: 'au as in how' },
    // Vyanjan (Consonants) - Popular ones
    { char: 'क', name: 'कबूतर', emoji: '🕊️', color: '#6366f1', transliteration: 'ka', pronunciation: 'ka' },
    { char: 'ख', name: 'खरगोश', emoji: '🐰', color: '#f59e0b', transliteration: 'kha', pronunciation: 'kha' },
    { char: 'ग', name: 'गाय', emoji: '🐄', color: '#eab308', transliteration: 'ga', pronunciation: 'ga' },
    { char: 'घ', name: 'घड़ी', emoji: '🕐', color: '#10b981', transliteration: 'gha', pronunciation: 'gha' },
    { char: 'च', name: 'चम्मच', emoji: '🥄', color: '#64748b', transliteration: 'cha', pronunciation: 'cha' },
    { char: 'छ', name: 'छतरी', emoji: '☂️', color: '#3b82f6', transliteration: 'chha', pronunciation: 'chha' },
    { char: 'ज', name: 'जहाज', emoji: '🚢', color: '#06b6d4', transliteration: 'ja', pronunciation: 'ja' },
    { char: 'झ', name: 'झंडा', emoji: '🚩', color: '#ef4444', transliteration: 'jha', pronunciation: 'jha' },
    { char: 'ट', name: 'टमाटर', emoji: '🍅', color: '#dc2626', transliteration: 'ta', pronunciation: 'ta (hard)' },
    { char: 'ड', name: 'डमरू', emoji: '🥁', transliteration: 'da', color: '#f97316', pronunciation: 'da (hard)' },
    { char: 'त', name: 'तरबूज', emoji: '🍉', color: '#16a34a', transliteration: 'ta', pronunciation: 'ta (soft)' },
    { char: 'द', name: 'दवात', emoji: '🖋️', color: '#1f2937', transliteration: 'da', pronunciation: 'da (soft)' },
    { char: 'न', name: 'नल', emoji: '🚰', color: '#3b82f6', transliteration: 'na', pronunciation: 'na' },
    { char: 'प', name: 'पतंग', emoji: '🪁', color: '#ec4899', transliteration: 'pa', pronunciation: 'pa' },
    { char: 'फ', name: 'फल', emoji: '🍎', color: '#ef4444', transliteration: 'pha', pronunciation: 'pha' },
    { char: 'ब', name: 'बतख', emoji: '🦆', color: '#f59e0b', transliteration: 'ba', pronunciation: 'ba' },
    { char: 'भ', name: 'भालू', emoji: '🐻', color: '#a16207', transliteration: 'bha', pronunciation: 'bha' },
    { char: 'म', name: 'मछली', emoji: '🐟', color: '#06b6d4', transliteration: 'ma', pronunciation: 'ma' },
    { char: 'य', name: 'यज्ञ', emoji: '🔥', color: '#f97316', transliteration: 'ya', pronunciation: 'ya' },
    { char: 'र', name: 'रथ', emoji: '🛺', color: '#eab308', transliteration: 'ra', pronunciation: 'ra' },
    { char: 'ल', name: 'लड्डू', emoji: '🟡', color: '#f59e0b', transliteration: 'la', pronunciation: 'la' },
    { char: 'व', name: 'वक', emoji: '🦢', color: '#fff', transliteration: 'va', pronunciation: 'va' },
    { char: 'श', name: 'शलजम', emoji: '🥔', color: '#a855f7', transliteration: 'sha', pronunciation: 'sha' },
    { char: 'स', name: 'सेब', emoji: '🍎', color: '#ef4444', transliteration: 'sa', pronunciation: 'sa' },
    { char: 'ह', name: 'हथी', emoji: '🐘', color: '#64748b', transliteration: 'ha', pronunciation: 'ha' },
  ],
};

// Kannada Alphabet
export const kannadaAlphabet: Alphabet = {
  language: 'kannada',
  name: 'ಕನ್ನಡ (Kannada)',
  letters: [
    // Swaras (Vowels)
    { char: 'ಅ', name: 'ಅಪ್ಪೆ', emoji: '🐚', color: '#ef4444', transliteration: 'a', pronunciation: 'a as in about' },
    { char: 'ಆ', name: 'ಆನೆ', emoji: '🐘', color: '#64748b', transliteration: 'aa', pronunciation: 'aa as in father' },
    { char: 'ಇ', name: 'ಇಲಿ', emoji: '🐁', color: '#a16207', transliteration: 'i', pronunciation: 'i as in sit' },
    { char: 'ಈ', name: 'ಈಶ್ವರ', emoji: '🙏', color: '#f59e0b', transliteration: 'ee', pronunciation: 'ee as in feet' },
    { char: 'ಉ', name: 'ಉಪ್ಪು', emoji: '🧂', color: '#64748b', transliteration: 'u', pronunciation: 'u as in put' },
    { char: 'ಊ', name: 'ಊಟ', emoji: '🍽️', color: '#f97316', transliteration: 'oo', pronunciation: 'oo as in food' },
    { char: 'ಎ', name: 'ಎಲೆ', emoji: '🍃', color: '#16a34a', transliteration: 'e', pronunciation: 'e as in bed' },
    { char: 'ಏ', name: 'ಏಣಿ', emoji: '🪜', color: '#a16207', transliteration: 'ae', pronunciation: 'ae as in fair' },
    { char: 'ಐ', name: 'ಐದು', emoji: '5️⃣', color: '#3b82f6', transliteration: 'ai', pronunciation: 'ai as in fair' },
    { char: 'ಒ', name: 'ಒಕ್ಕಲು', emoji: '🌾', color: '#eab308', transliteration: 'o', pronunciation: 'o as in go' },
    { char: 'ಓ', name: 'ಓಡು', emoji: '🏃', color: '#ec4899', transliteration: 'oa', pronunciation: 'oa as in boat' },
    { char: 'ಔ', name: 'ಔಷಧ', emoji: '💊', color: '#ef4444', transliteration: 'au', pronunciation: 'au as in how' },
    // Vyanjanas (Consonants)
    { char: 'ಕ', name: 'ಕಪ್ಪು', emoji: '⬛', color: '#1f2937', transliteration: 'ka', pronunciation: 'ka' },
    { char: 'ಖ', name: 'ಖಡ್ಗ', emoji: '⚔️', color: '#64748b', transliteration: 'kha', pronunciation: 'kha' },
    { char: 'ಗ', name: 'ಗಿಡ', emoji: '🪴', color: '#16a34a', transliteration: 'ga', pronunciation: 'ga' },
    { char: 'ಘ', name: 'ಘೋಡೆ', emoji: '🐴', color: '#a16207', transliteration: 'gha', pronunciation: 'gha' },
    { char: 'ಚ', name: 'ಚೆಂಡು', emoji: '⚽', color: '#dc2626', transliteration: 'cha', pronunciation: 'cha' },
    { char: 'ಛ', name: 'ಛತ್ರಿ', emoji: '☂️', color: '#3b82f6', transliteration: 'chha', pronunciation: 'chha' },
    { char: 'ಜ', name: 'ಜೇನು', emoji: '🍯', color: '#f59e0b', transliteration: 'ja', pronunciation: 'ja' },
    { char: 'ಝ', name: 'ಝರಿ', emoji: '🌊', color: '#06b6d4', transliteration: 'jha', pronunciation: 'jha' },
    { char: 'ಟ', name: 'ಟೊಮ್ಯಾಟೊ', emoji: '🍅', color: '#ef4444', transliteration: 'ta', pronunciation: 'ta (hard)' },
    { char: 'ಡ', name: 'ಡೊಣ್ಣೆ', emoji: '☂️', color: '#8b5cf6', transliteration: 'da', pronunciation: 'da (hard)' },
    { char: 'ತ', name: 'ತಾಳಿ', emoji: '🍽️', color: '#fff', transliteration: 'ta', pronunciation: 'ta (soft)' },
    { char: 'ದ', name: 'ದಿಂಬು', emoji: '⛰️', color: '#16a34a', transliteration: 'da', pronunciation: 'da (soft)' },
    { char: 'ನ', name: 'ನದಿ', emoji: '🏞️', color: '#3b82f6', transliteration: 'na', pronunciation: 'na' },
    { char: 'ಪ', name: 'ಪುಸ್ತಕ', emoji: '📚', color: '#a855f7', transliteration: 'pa', pronunciation: 'pa' },
    { char: 'ಫ', name: 'ಫಲ', emoji: '🍎', color: '#ef4444', transliteration: 'pha', pronunciation: 'pha' },
    { char: 'ಬ', name: 'ಬಾಳೆ', emoji: '🍌', color: '#eab308', transliteration: 'ba', pronunciation: 'ba' },
    { char: 'ಭ', name: 'ಭೂತ', emoji: '👻', color: '#8b5cf6', transliteration: 'bha', pronunciation: 'bha' },
    { char: 'ಮ', name: 'ಮೀನು', emoji: '🐟', color: '#06b6d4', transliteration: 'ma', pronunciation: 'ma' },
    { char: 'ಯ', name: 'ಯಾನ', emoji: '🚗', color: '#f97316', transliteration: 'ya', pronunciation: 'ya' },
    { char: 'ರ', name: 'ರವಿ', emoji: '☀️', color: '#eab308', transliteration: 'ra', pronunciation: 'ra' },
    { char: 'ಲ', name: 'ಲಿಂಬೆ', emoji: '🍋', color: '#f59e0b', transliteration: 'la', pronunciation: 'la' },
    { char: 'ವ', name: 'ವನ', emoji: '🌲', color: '#16a34a', transliteration: 'va', pronunciation: 'va' },
    { char: 'ಶ', name: 'ಶಂಖ', emoji: '🐚', color: '#f59e0b', transliteration: 'sha', pronunciation: 'sha' },
    { char: 'ಸ', name: 'ಸೂರ್ಯ', emoji: '☀️', color: '#f97316', transliteration: 'sa', pronunciation: 'sa' },
    { char: 'ಹ', name: 'ಹಕ್ಕಿ', emoji: '🐦', color: '#3b82f6', transliteration: 'ha', pronunciation: 'ha' },
    { char: 'ಳ', name: 'ಳಂಡ', emoji: '🦎', color: '#16a34a', transliteration: 'la', pronunciation: 'la (retroflex)' },
  ],
};

// Telugu Alphabet
export const teluguAlphabet: Alphabet = {
  language: 'telugu',
  name: 'తెలుగు (Telugu)',
  letters: [
    // Achulu (Vowels)
    { char: 'అ', name: 'అన్నం', emoji: '🍚', color: '#ef4444', transliteration: 'a', pronunciation: 'a as in about' },
    { char: 'ఆ', name: 'ఆవు', emoji: '🐄', color: '#f59e0b', transliteration: 'aa', pronunciation: 'aa as in father' },
    { char: 'ఇ', name: 'ఇల్లు', emoji: '🏠', color: '#84cc16', transliteration: 'i', pronunciation: 'i as in sit' },
    { char: 'ఈ', name: 'ఈగ', emoji: '🦟', color: '#16a34a', transliteration: 'ee', pronunciation: 'ee as in feet' },
    { char: 'ఉ', name: 'ఉంగరం', emoji: '💍', color: '#a16207', transliteration: 'u', pronunciation: 'u as in put' },
    { char: 'ఊ', name: 'ఊయల', emoji: '🛏️', color: '#f97316', transliteration: 'oo', pronunciation: 'oo as in food' },
    { char: 'ఎ', name: 'ఎలుక', emoji: '🐁', color: '#ec4899', transliteration: 'e', pronunciation: 'e as in bed' },
    { char: 'ఏ', name: 'ఏనుగ', emoji: '🐘', color: '#3b82f6', transliteration: 'ae', pronunciation: 'ae as in fair' },
    { char: 'ఐ', name: 'ఐదు', emoji: '5️⃣', color: '#8b5cf6', transliteration: 'ai', pronunciation: 'ai as in fair' },
    { char: 'ఒ', name: 'ఒకటి', emoji: '1️⃣', color: '#06b6d4', transliteration: 'o', pronunciation: 'o as in go' },
    { char: 'ఓ', name: 'ఓడ', emoji: '🚢', color: '#eab308', transliteration: 'oa', pronunciation: 'oa as in boat' },
    { char: 'ఔ', name: 'ఔషధం', emoji: '💊', color: '#ef4444', transliteration: 'au', pronunciation: 'au as in how' },
    // Hallulu (Consonants)
    { char: 'క', name: 'కమలం', emoji: '🪷', color: '#ec4899', transliteration: 'ka', pronunciation: 'ka' },
    { char: 'ఖ', name: 'ఖడ్గం', emoji: '⚔️', color: '#64748b', transliteration: 'kha', pronunciation: 'kha' },
    { char: 'గ', name: 'గొంగళి', emoji: '🐚', color: '#f59e0b', transliteration: 'ga', pronunciation: 'ga' },
    { char: 'ఘ', name: 'ఘోడా', emoji: '🐴', color: '#a16207', transliteration: 'gha', pronunciation: 'gha' },
    { char: 'చ', name: 'చెర్రీ', emoji: '🍒', color: '#dc2626', transliteration: 'cha', pronunciation: 'cha' },
    { char: 'ఛ', name: 'ఛత్రం', emoji: '☂️', color: '#3b82f6', transliteration: 'chha', pronunciation: 'chha' },
    { char: 'జ', name: 'జామ', emoji: '🍈', color: '#f59e0b', transliteration: 'ja', pronunciation: 'ja' },
    { char: 'ఝ', name: 'ఝరి', emoji: '🌊', color: '#06b6d4', transliteration: 'jha', pronunciation: 'jha' },
    { char: 'ట', name: 'టమాటా', emoji: '🍅', color: '#ef4444', transliteration: 'ta', pronunciation: 'ta (hard)' },
    { char: 'డ', name: 'డ్రాగన్', emoji: '🐉', color: '#16a34a', transliteration: 'da', pronunciation: 'da (hard)' },
    { char: 'త', name: 'తాటి', emoji: '🌴', color: '#eab308', transliteration: 'ta', pronunciation: 'ta (soft)' },
    { char: 'ద', name: 'దోసకాయ', emoji: '🥒', color: '#16a34a', transliteration: 'da', pronunciation: 'da (soft)' },
    { char: 'న', name: 'నది', emoji: '🏞️', color: '#3b82f6', transliteration: 'na', pronunciation: 'na' },
    { char: 'ప', name: 'పప్పు', emoji: '🥜', color: '#a855f7', transliteration: 'pa', pronunciation: 'pa' },
    { char: 'ఫ', name: 'ఫలం', emoji: '🍎', color: '#ef4444', transliteration: 'pha', pronunciation: 'pha' },
    { char: 'బ', name: 'బొమ్మ', emoji: '🪆', color: '#ec4899', transliteration: 'ba', pronunciation: 'ba' },
    { char: 'భ', name: 'భూమి', emoji: '🌍', color: '#16a34a', transliteration: 'bha', pronunciation: 'bha' },
    { char: 'మ', name: 'మామిడి', emoji: '🥭', color: '#f59e0b', transliteration: 'ma', pronunciation: 'ma' },
    { char: 'య', name: 'యానాం', emoji: '🚗', color: '#f97316', transliteration: 'ya', pronunciation: 'ya' },
    { char: 'ర', name: 'రవి', emoji: '☀️', color: '#eab308', transliteration: 'ra', pronunciation: 'ra' },
    { char: 'ల', name: 'లింబు', emoji: '🍋', color: '#84cc16', transliteration: 'la', pronunciation: 'la' },
    { char: 'వ', name: 'వనం', emoji: '🌳', color: '#16a34a', transliteration: 'va', pronunciation: 'va' },
    { char: 'శ', name: 'శంఖు', emoji: '🐚', color: '#f59e0b', transliteration: 'sha', pronunciation: 'sha' },
    { char: 'స', name: 'సూర్యుడు', emoji: '☀️', color: '#f97316', transliteration: 'sa', pronunciation: 'sa' },
    { char: 'హ', name: 'హంస', emoji: '🦢', color: '#fff', transliteration: 'ha', pronunciation: 'ha' },
  ],
};

// Tamil Alphabet
export const tamilAlphabet: Alphabet = {
  language: 'tamil',
  name: 'தமிழ் (Tamil)',
  letters: [
    // Uyir Ezhuthukkal (Vowels)
    { char: 'அ', name: 'அப்பம்', emoji: '🥞', color: '#ef4444', transliteration: 'a', pronunciation: 'a as in about' },
    { char: 'ஆ', name: 'ஆமை', emoji: '🐢', color: '#16a34a', transliteration: 'aa', pronunciation: 'aa as in father' },
    { char: 'இ', name: 'இலை', emoji: '🍃', color: '#84cc16', transliteration: 'i', pronunciation: 'i as in sit' },
    { char: 'ஈ', name: 'ஈச்சம்', emoji: '🌴', color: '#a16207', transliteration: 'ee', pronunciation: 'ee as in feet' },
    { char: 'உ', name: 'உடும்பு', emoji: '🦎', color: '#16a34a', transliteration: 'u', pronunciation: 'u as in put' },
    { char: 'ஊ', name: 'ஊசி', emoji: '🪡', color: '#64748b', transliteration: 'oo', pronunciation: 'oo as in food' },
    { char: 'எ', name: 'எலி', emoji: '🐁', color: '#a16207', transliteration: 'e', pronunciation: 'e as in bed' },
    { char: 'ஏ', name: 'ஏணி', emoji: '🪜', color: '#f59e0b', transliteration: 'ae', pronunciation: 'ae as in fair' },
    { char: 'ஐ', name: 'ஐந்து', emoji: '5️⃣', color: '#3b82f6', transliteration: 'ai', pronunciation: 'ai as in fair' },
    { char: 'ஒ', name: 'ஒட்டகம்', emoji: '🐪', color: '#eab308', transliteration: 'o', pronunciation: 'o as in go' },
    { char: 'ஓ', name: 'ஓடம்', emoji: '🚣', color: '#06b6d4', transliteration: 'oa', pronunciation: 'oa as in boat' },
    { char: 'ஔ', name: 'ஔவை', emoji: '👵', color: '#8b5cf6', transliteration: 'au', pronunciation: 'au as in how' },
    // Mei Ezhuthukkal (Consonants)
    { char: 'க', name: 'கமலம்', emoji: '🪷', color: '#ec4899', transliteration: 'ka', pronunciation: 'ka' },
    { char: 'ங', name: 'ங', emoji: '🔔', color: '#eab308', transliteration: 'nga', pronunciation: 'nga' },
    { char: 'ச', name: 'சக்கரம்', emoji: '☸️', color: '#f59e0b', transliteration: 'cha', pronunciation: 'cha' },
    { char: 'ஞ', name: 'ஞாயிறு', emoji: '☀️', color: '#f97316', transliteration: 'nya', pronunciation: 'nya' },
    { char: 'ட', name: 'டம்ரூ', emoji: '🥁', color: '#a16207', transliteration: 'ta', pronunciation: 'ta (hard)' },
    { char: 'ண', name: 'ணவாய்', emoji: '🔱', color: '#eab308', transliteration: 'na', pronunciation: 'na (hard)' },
    { char: 'த', name: 'தங்கம்', emoji: '🥇', color: '#eab308', transliteration: 'tha', pronunciation: 'tha' },
    { char: 'ந', name: 'நந்தி', emoji: '🐂', color: '#a16207', transliteration: 'na', pronunciation: 'na' },
    { char: 'ப', name: 'பழம்', emoji: '🍎', color: '#ef4444', transliteration: 'pa', pronunciation: 'pa' },
    { char: 'ம', name: 'மாம்பழம்', emoji: '🥭', color: '#f59e0b', transliteration: 'ma', pronunciation: 'ma' },
    { char: 'ய', name: 'யானை', emoji: '🐘', color: '#64748b', transliteration: 'ya', pronunciation: 'ya' },
    { char: 'ர', name: 'ரதம்', emoji: '🛺', color: '#f97316', transliteration: 'ra', pronunciation: 'ra' },
    { char: 'ல', name: 'லிங்கம்', emoji: '🔔', color: '#eab308', transliteration: 'la', pronunciation: 'la' },
    { char: 'வ', name: 'வண்டி', emoji: '🚗', color: '#ef4444', transliteration: 'va', pronunciation: 'va' },
    { char: 'ழ', name: 'ழல', emoji: '🔥', color: '#f97316', transliteration: 'zha', pronunciation: 'zha (retroflex)' },
    { char: 'ள', name: 'ளவு', emoji: '📏', color: '#3b82f6', transliteration: 'la', pronunciation: 'la (retroflex)' },
    { char: 'ற', name: 'றவு', emoji: '🌊', color: '#06b6d4', transliteration: 'ra', pronunciation: 'ra (trilled)' },
    { char: 'ன', name: 'ன', emoji: '🔔', color: '#64748b', transliteration: 'na', pronunciation: 'na (soft)' },
  ],
};

// All alphabets
export const alphabets: Record<string, Alphabet> = {
  english: englishAlphabet,
  hindi: hindiAlphabet,
  kannada: kannadaAlphabet,
  telugu: teluguAlphabet,
  tamil: tamilAlphabet,
};

// Get alphabet by language
export function getAlphabet(language: string): Alphabet {
  return alphabets[language] || englishAlphabet;
}

// Get letters for game
export function getLettersForGame(language: string, difficulty: string = 'easy'): Letter[] {
  const alphabet = getAlphabet(language);
  const count = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : alphabet.letters.length;
  return alphabet.letters.slice(0, count);
}
