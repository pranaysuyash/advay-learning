// Multi-language alphabet data for learning games

export interface Letter {
  char: string;
  name: string;
  icon: string | string[]; // Can be a single icon or multiple icons to choose from
  color: string;
  transliteration?: string;
  pronunciation?: string;
  // Legacy field for backward compatibility
  emoji?: string;
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
    { char: 'A', name: 'Apple', icon: ['/assets/icons/apple.svg', '/assets/icons/aardvark.svg', '/assets/icons/airplane.svg'], color: '#ef4444', pronunciation: 'ay' },
    { char: 'B', name: 'Ball', icon: ['/assets/icons/ball.svg', '/assets/icons/bear.svg', '/assets/icons/boat.svg'], color: '#3b82f6', pronunciation: 'bee' },
    { char: 'C', name: 'Cat', icon: ['/assets/icons/cat.svg', '/assets/icons/cow.svg', '/assets/icons/cake.svg'], color: '#f59e0b', pronunciation: 'see' },
    { char: 'D', name: 'Dog', icon: ['/assets/icons/dog.svg', '/assets/icons/dolphin.svg', '/assets/icons/donut.svg'], color: '#10b981', pronunciation: 'dee' },
    { char: 'E', name: 'Elephant', icon: ['/assets/icons/elephant.svg', '/assets/icons/eagle.svg', '/assets/icons/egg.svg'], color: '#8b5cf6', pronunciation: 'ee' },
    { char: 'F', name: 'Fish', icon: ['/assets/icons/fish.svg', '/assets/icons/flower.svg', '/assets/icons/frog.svg'], color: '#06b6d4', pronunciation: 'ef' },
    { char: 'G', name: 'Grapes', icon: ['/assets/icons/grapes.svg', '/assets/icons/giraffe.svg', '/assets/icons/guitar.svg'], color: '#84cc16', pronunciation: 'jee' },
    { char: 'H', name: 'House', icon: ['/assets/icons/house.svg', '/assets/icons/heart.svg', '/assets/icons/hat.svg'], color: '#f97316', pronunciation: 'aych' },
    { char: 'I', name: 'Ice cream', icon: ['/assets/icons/ice-cream.svg', '/assets/icons/igloo.svg', '/assets/icons/ice.svg'], color: '#ec4899', pronunciation: 'eye' },
    { char: 'J', name: 'Juice', icon: ['/assets/icons/juice.svg', '/assets/icons/jellyfish.svg', '/assets/icons/jacket.svg'], color: '#eab308', pronunciation: 'jay' },
    { char: 'K', name: 'Kite', icon: ['/assets/icons/kite.svg', '/assets/icons/key.svg', '/assets/icons/kangaroo.svg'], color: '#6366f1', pronunciation: 'kay' },
    { char: 'L', name: 'Lion', icon: ['/assets/icons/lion.svg', '/assets/icons/lamp.svg', '/assets/icons/laptop.svg'], color: '#f59e0b', pronunciation: 'el' },
    { char: 'M', name: 'Moon', icon: ['/assets/icons/moon.svg', '/assets/icons/monkey.svg', '/assets/icons/mushroom.svg'], color: '#64748b', pronunciation: 'em' },
    { char: 'N', name: 'Nest', icon: ['/assets/icons/nest.svg', '/assets/icons/net.svg', '/assets/icons/nose.svg'], color: '#a16207', pronunciation: 'en' },
    { char: 'O', name: 'Orange', icon: ['/assets/icons/orange.svg', '/assets/icons/octopus.svg', '/assets/icons/owl.svg'], color: '#f97316', pronunciation: 'oh' },
    { char: 'P', name: 'Pencil', icon: ['/assets/icons/pencil.svg', '/assets/icons/pizza.svg', '/assets/icons/penguin.svg'], color: '#eab308', pronunciation: 'pee' },
    { char: 'Q', name: 'Queen', icon: ['/assets/icons/queen.svg', '/assets/icons/quill.svg', '/assets/icons/quiz.svg'], color: '#a855f7', pronunciation: 'cue' },
    { char: 'R', name: 'Rainbow', icon: ['/assets/icons/rainbow.svg', '/assets/icons/rabbit.svg', '/assets/icons/radio.svg'], color: '#ec4899', pronunciation: 'ar' },
    { char: 'S', name: 'Sun', icon: ['/assets/icons/sun.svg', '/assets/icons/star.svg', '/assets/icons/snake.svg'], color: '#eab308', pronunciation: 'ess' },
    { char: 'T', name: 'Tree', icon: ['/assets/icons/tree.svg', '/assets/icons/tiger.svg', '/assets/icons/train.svg'], color: '#16a34a', pronunciation: 'tee' },
    { char: 'U', name: 'Umbrella', icon: ['/assets/icons/umbrella.svg', '/assets/icons/unicorn.svg', '/assets/icons/underwear.svg'], color: '#3b82f6', pronunciation: 'you' },
    { char: 'V', name: 'Violin', icon: ['/assets/icons/violin.svg', '/assets/icons/van.svg', '/assets/icons/vase.svg'], color: '#8b5cf6', pronunciation: 'vee' },
    { char: 'W', name: 'Watermelon', icon: ['/assets/icons/watermelon.svg', '/assets/icons/whale.svg', '/assets/icons/watch.svg'], color: '#ef4444', pronunciation: 'double-you' },
    { char: 'X', name: 'Xylophone', icon: ['/assets/icons/xylophone.svg', '/assets/icons/xray.svg', '/assets/icons/xmas-tree.svg'], color: '#f59e0b', pronunciation: 'ex' },
    { char: 'Y', name: 'Yacht', icon: ['/assets/icons/yacht.svg', '/assets/icons/yak.svg', '/assets/icons/yoyo.svg'], color: '#06b6d4', pronunciation: 'why' },
    { char: 'Z', name: 'Zebra', icon: ['/assets/icons/zebra.svg', '/assets/icons/zipper.svg', '/assets/icons/zoo.svg'], color: '#1f2937', pronunciation: 'zee' },
  ],
};

// Hindi Alphabet (Swar - Vowels and Vyanjan - Consonants)
// FIXED: Updated emojis to be culturally appropriate and distinct from English
export const hindiAlphabet: Alphabet = {
  language: 'hindi',
  name: 'हिन्दी (Hindi)',
  letters: [
    // Swar (Vowels) - FIXED: Changed emojis to reflect Hindi words
    { char: 'अ', name: 'अनार', icon: ['/assets/icons/muskmelon.svg', '/assets/icons/anjir.svg', '/assets/icons/achar.svg'], color: '#ef4444', transliteration: 'a', pronunciation: 'a as in about' },
    { char: 'आ', name: 'आम', icon: ['/assets/icons/mango.svg', '/assets/icons/amrud.svg', '/assets/icons/amber.svg'], color: '#f59e0b', transliteration: 'aa', pronunciation: 'aa as in father' },
    { char: 'इ', name: 'इमली', icon: ['/assets/icons/tamarind.svg', '/assets/icons/iliachi.svg', '/assets/icons/indradhanush.svg'], color: '#84cc16', transliteration: 'i', pronunciation: 'i as in sit' },
    { char: 'ई', name: 'ईख', icon: ['/assets/icons/sugarcane.svg', '/assets/icons/iceberg.svg', '/assets/icons/ink.svg'], color: '#16a34a', transliteration: 'ee', pronunciation: 'ee as in feet' },
    { char: 'उ', name: 'उल्लू', icon: ['/assets/icons/owl.svg', '/assets/icons/udumbu.svg', '/assets/icons/umbrella.svg'], color: '#a16207', transliteration: 'u', pronunciation: 'u as in put' },
    { char: 'ऊ', name: 'ऊन', icon: ['/assets/icons/yarn.svg', '/assets/icons/ootan.svg', '/assets/icons/ujala.svg'], color: '#f97316', transliteration: 'oo', pronunciation: 'oo as in food' },
    { char: 'ए', name: 'एड़ी', icon: ['/assets/icons/foot.svg', '/assets/icons/ekta.svg', '/assets/icons/ekg.svg'], color: '#ec4899', transliteration: 'e', pronunciation: 'e as in bed' },
    { char: 'ऐ', name: 'ऐनक', icon: ['/assets/icons/glasses.svg', '/assets/icons/aaina.svg', '/assets/icons/air.svg'], color: '#3b82f6', transliteration: 'ai', pronunciation: 'ai as in fair' },
    { char: 'ओ', name: 'ओखली', icon: ['/assets/icons/mortar.svg', '/assets/icons/ok.svg', '/assets/icons/omb.svg'], color: '#8b5cf6', transliteration: 'o', pronunciation: 'o as in go' },
    { char: 'औ', name: 'औरत', icon: ['/assets/icons/woman.svg', '/assets/icons/aur.svg', '/assets/icons/audi.svg'], color: '#06b6d4', transliteration: 'au', pronunciation: 'au as in how' },
    // Vyanjan (Consonants) - Popular ones
    { char: 'क', name: 'कबूतर', icon: ['/assets/icons/dove.svg', '/assets/icons/kamal.svg', '/assets/icons/kela.svg'], color: '#6366f1', transliteration: 'ka', pronunciation: 'ka' },
    { char: 'ख', name: 'खरगोश', icon: ['/assets/icons/rabbit.svg', '/assets/icons/kharbuja.svg', '/assets/icons/khat.svg'], color: '#f59e0b', transliteration: 'kha', pronunciation: 'kha' },
    { char: 'ग', name: 'गाय', icon: ['/assets/icons/cow.svg', '/assets/icons/genda.svg', '/assets/icons/guitar.svg'], color: '#eab308', transliteration: 'ga', pronunciation: 'ga' },
    { char: 'घ', name: 'घड़ी', icon: ['/assets/icons/clock.svg', '/assets/icons/ghanta.svg', '/assets/icons/ghoda.svg'], color: '#10b981', transliteration: 'gha', pronunciation: 'gha' },
    { char: 'च', name: 'चम्मच', icon: ['/assets/icons/spoon.svg', '/assets/icons/chamak.svg', '/assets/icons/chain.svg'], color: '#64748b', transliteration: 'cha', pronunciation: 'cha' },
    { char: 'छ', name: 'छतरी', icon: ['/assets/icons/umbrella.svg', '/assets/icons/chatri.svg', '/assets/icons/chain.svg'], color: '#3b82f6', transliteration: 'chha', pronunciation: 'chha' },
    { char: 'ज', name: 'जहाज', icon: ['/assets/icons/ship.svg', '/assets/icons/jag.svg', '/assets/icons/jadoo.svg'], color: '#06b6d4', transliteration: 'ja', pronunciation: 'ja' },
    { char: 'झ', name: 'झंडा', icon: ['/assets/icons/flag.svg', '/assets/icons/jhoola.svg', '/assets/icons/jhal.svg'], color: '#ef4444', transliteration: 'jha', pronunciation: 'jha' },
    { char: 'ट', name: 'टमाटर', icon: ['/assets/icons/tomato.svg', '/assets/icons/tanga.svg', '/assets/icons/ticket.svg'], color: '#dc2626', transliteration: 'ta', pronunciation: 'ta (hard)' },
    { char: 'ड', name: 'डमरू', icon: ['/assets/icons/drum.svg', '/assets/icons/dabba.svg', '/assets/icons/dal.svg'], transliteration: 'da', color: '#f97316', pronunciation: 'da (hard)' },
    { char: 'त', name: 'तरबूज', icon: ['/assets/icons/watermelon.svg', '/assets/icons/taj.svg', '/assets/icons/towel.svg'], color: '#16a34a', transliteration: 'ta', pronunciation: 'ta (soft)' },
    { char: 'द', name: 'दवात', icon: ['/assets/icons/fountain-pen.svg', '/assets/icons/diya.svg', '/assets/icons/dal.svg'], color: '#1f2937', transliteration: 'da', pronunciation: 'da (soft)' },
    { char: 'न', name: 'नल', icon: ['/assets/icons/tap.svg', '/assets/icons/nariyal.svg', '/assets/icons/note.svg'], color: '#3b82f6', transliteration: 'na', pronunciation: 'na' },
    { char: 'प', name: 'पतंग', icon: ['/assets/icons/kite.svg', '/assets/icons/papad.svg', '/assets/icons/piano.svg'], color: '#ec4899', transliteration: 'pa', pronunciation: 'pa' },
    { char: 'फ', name: 'फल', icon: ['/assets/icons/grapes.svg', '/assets/icons/phool.svg', '/assets/icons/phone.svg'], color: '#ef4444', transliteration: 'pha', pronunciation: 'pha' },
    { char: 'ब', name: 'बतख', icon: ['/assets/icons/duck.svg', '/assets/icons/badam.svg', '/assets/icons/bicycle.svg'], color: '#f59e0b', transliteration: 'ba', pronunciation: 'ba' },
    { char: 'भ', name: 'भालू', icon: ['/assets/icons/bear.svg', '/assets/icons/bhel.svg', '/assets/icons/bottle.svg'], color: '#a16207', transliteration: 'bha', pronunciation: 'bha' },
    { char: 'म', name: 'मछली', icon: ['/assets/icons/fish.svg', '/assets/icons/makhi.svg', '/assets/icons/music.svg'], color: '#06b6d4', transliteration: 'ma', pronunciation: 'ma' },
    { char: 'य', name: 'यज्ञ', icon: ['/assets/icons/fire.svg', '/assets/icons/yoga.svg', '/assets/icons/yellow.svg'], color: '#f97316', transliteration: 'ya', pronunciation: 'ya' },
    { char: 'र', name: 'रथ', icon: ['/assets/icons/auto.svg', '/assets/icons/rickshaw.svg', '/assets/icons/radio.svg'], color: '#eab308', transliteration: 'ra', pronunciation: 'ra' },
    { char: 'ल', name: 'लड्डू', icon: ['/assets/icons/laddu.svg', '/assets/icons/lauki.svg', '/assets/icons/laptop.svg'], color: '#f59e0b', transliteration: 'la', pronunciation: 'la' },
    { char: 'व', name: 'वक', icon: ['/assets/icons/swan.svg', '/assets/icons/van.svg', '/assets/icons/vase.svg'], color: '#64748b', transliteration: 'va', pronunciation: 'va' },
    { char: 'श', name: 'शलजम', icon: ['/assets/icons/potato.svg', '/assets/icons/shamiyana.svg', '/assets/icons/shirt.svg'], color: '#a855f7', transliteration: 'sha', pronunciation: 'sha' },
    { char: 'स', name: 'सेब', icon: ['/assets/icons/apple-green.svg', '/assets/icons/santoor.svg', '/assets/icons/sitar.svg'], color: '#16a34a', transliteration: 'sa', pronunciation: 'sa' },
    { char: 'ह', name: 'हथी', icon: ['/assets/icons/elephant.svg', '/assets/icons/haldi.svg', '/assets/icons/harp.svg'], color: '#64748b', transliteration: 'ha', pronunciation: 'ha' },
  ],
};

// Kannada Alphabet
export const kannadaAlphabet: Alphabet = {
  language: 'kannada',
  name: 'ಕನ್ನಡ (Kannada)',
  letters: [
    // Swaras (Vowels)
    { char: 'ಅ', name: 'ಅಪ್ಪೆ', icon: ['/assets/icons/conch.svg', '/assets/icons/akshata.svg', '/assets/icons/agni.svg'], color: '#ef4444', transliteration: 'a', pronunciation: 'a as in about' },
    { char: 'ಆ', name: 'ಆನೆ', icon: ['/assets/icons/elephant.svg', '/assets/icons/ashwatha.svg', '/assets/icons/akshara.svg'], color: '#64748b', transliteration: 'aa', pronunciation: 'aa as in father' },
    { char: 'ಇ', name: 'ಇಲಿ', icon: ['/assets/icons/mouse.svg', '/assets/icons/indra.svg', '/assets/icons/indian-flag.svg'], color: '#a16207', transliteration: 'i', pronunciation: 'i as in sit' },
    { char: 'ಈ', name: 'ಈಶ್ವರ', icon: ['/assets/icons/prayer.svg', '/assets/icons/indian-elephant.svg', '/assets/icons/indian-tea.svg'], color: '#f59e0b', transliteration: 'ee', pronunciation: 'ee as in feet' },
    { char: 'ಉ', name: 'ಉಪ್ಪು', icon: ['/assets/icons/salt.svg', '/assets/icons/usha.svg', '/assets/icons/udupi.svg'], color: '#64748b', transliteration: 'u', pronunciation: 'u as in put' },
    { char: 'ಊ', name: 'ಊಟ', icon: ['/assets/icons/food.svg', '/assets/icons/ulli.svg', '/assets/icons/uttapam.svg'], color: '#f97316', transliteration: 'oo', pronunciation: 'oo as in food' },
    { char: 'ಎ', name: 'ಎಲೆ', icon: ['/assets/icons/leaf.svg', '/assets/icons/elephant-tusk.svg', '/assets/icons/embroidery.svg'], color: '#16a34a', transliteration: 'e', pronunciation: 'e as in bed' },
    { char: 'ಏ', name: 'ಏಣಿ', icon: ['/assets/icons/ladder.svg', '/assets/icons/ekadashi.svg', '/assets/icons/elephant-mask.svg'], color: '#a16207', transliteration: 'ae', pronunciation: 'ae as in fair' },
    { char: 'ಐ', name: 'ಐದು', icon: ['/assets/icons/five.svg', '/assets/icons/air-india.svg', '/assets/icons/indian-spice.svg'], color: '#3b82f6', transliteration: 'ai', pronunciation: 'ai as in fair' },
    { char: 'ಒ', name: 'ಒಕ್ಕಲು', icon: ['/assets/icons/farm.svg', '/assets/icons/olage.svg', '/assets/icons/onion.svg'], color: '#eab308', transliteration: 'o', pronunciation: 'o as in go' },
    { char: 'ಓ', name: 'ಓಡು', icon: ['/assets/icons/run.svg', '/assets/icons/om.svg', '/assets/icons/oregano.svg'], color: '#ec4899', transliteration: 'oa', pronunciation: 'oa as in boat' },
    { char: 'ಔ', name: 'ಔಷಧ', icon: ['/assets/icons/medicine.svg', '/assets/icons/oud.svg', '/assets/icons/aurangabad.svg'], color: '#ef4444', transliteration: 'au', pronunciation: 'au as in how' },
    // Vyanjanas (Consonants)
    { char: 'ಕ', name: 'ಕಪ್ಪು', icon: ['/assets/icons/square.svg', '/assets/icons/kambala.svg', '/assets/icons/karnataka.svg'], color: '#1f2937', transliteration: 'ka', pronunciation: 'ka' },
    { char: 'ಖ', name: 'ಖಡ್ಗ', icon: ['/assets/icons/sword.svg', '/assets/icons/khaki.svg', '/assets/icons/khasi.svg'], color: '#64748b', transliteration: 'kha', pronunciation: 'kha' },
    { char: 'ಗ', name: 'ಗಿಡ', icon: ['/assets/icons/plant.svg', '/assets/icons/ganesha.svg', '/assets/icons/govinda.svg'], color: '#16a34a', transliteration: 'ga', pronunciation: 'ga' },
    { char: 'ಘ', name: 'ಘೋಡೆ', icon: ['/assets/icons/horse.svg', '/assets/icons/ghante.svg', '/assets/icons/gharana.svg'], color: '#a16207', transliteration: 'gha', pronunciation: 'gha' },
    { char: 'ಚ', name: 'ಚೆಂಡು', icon: ['/assets/icons/ball.svg', '/assets/icons/chitrakala.svg', '/assets/icons/chennai.svg'], color: '#dc2626', transliteration: 'cha', pronunciation: 'cha' },
    { char: 'ಛ', name: 'ಛತ್ರಿ', icon: ['/assets/icons/umbrella.svg', '/assets/icons/chatur.svg', '/assets/icons/chakra.svg'], color: '#3b82f6', transliteration: 'chha', pronunciation: 'chha' },
    { char: 'ಜ', name: 'ಜೇನು', icon: ['/assets/icons/honey.svg', '/assets/icons/jagannath.svg', '/assets/icons/jasmine.svg'], color: '#f59e0b', transliteration: 'ja', pronunciation: 'ja' },
    { char: 'ಝ', name: 'ಝರಿ', icon: ['/assets/icons/wave.svg', '/assets/icons/jhoomar.svg', '/assets/icons/zebra.svg'], color: '#06b6d4', transliteration: 'jha', pronunciation: 'jha' },
    { char: 'ಟ', name: 'ಟೊಮ್ಯಾಟೊ', icon: ['/assets/icons/tomato.svg', '/assets/icons/tambura.svg', '/assets/icons/tanjore.svg'], color: '#ef4444', transliteration: 'ta', pronunciation: 'ta (hard)' },
    { char: 'ಡ', name: 'ಡೊಣ್ಣೆ', icon: ['/assets/icons/umbrella.svg', '/assets/icons/dhol.svg', '/assets/icons/durga.svg'], color: '#8b5cf6', transliteration: 'da', pronunciation: 'da (hard)' },
    { char: 'ತ', name: 'ತಾಳಿ', icon: ['/assets/icons/food.svg', '/assets/icons/taj-mahal.svg', '/assets/icons/turmeric.svg'], color: '#fff', transliteration: 'ta', pronunciation: 'ta (soft)' },
    { char: 'ದ', name: 'ದಿಂಬು', icon: ['/assets/icons/mountain.svg', '/assets/icons/darshan.svg', '/assets/icons/diwali.svg'], color: '#16a34a', transliteration: 'da', pronunciation: 'da (soft)' },
    { char: 'ನ', name: 'ನದಿ', icon: ['/assets/icons/river.svg', '/assets/icons/nandi.svg', '/assets/icons/namaste.svg'], color: '#3b82f6', transliteration: 'na', pronunciation: 'na' },
    { char: 'ಪ', name: 'ಪುಸ್ತಕ', icon: ['/assets/icons/book.svg', '/assets/icons/puja.svg', '/assets/icons/pune.svg'], color: '#a855f7', transliteration: 'pa', pronunciation: 'pa' },
    { char: 'ಫ', name: 'ಫಲ', icon: ['/assets/icons/apple.svg', '/assets/icons/phoenix.svg', '/assets/icons/phone.svg'], color: '#ef4444', transliteration: 'pha', pronunciation: 'pha' },
    { char: 'ಬ', name: 'ಬಾಳೆ', icon: ['/assets/icons/banana.svg', '/assets/icons/bangalore.svg', '/assets/icons/brahma.svg'], color: '#eab308', transliteration: 'ba', pronunciation: 'ba' },
    { char: 'ಭ', name: 'ಭೂತ', icon: ['/assets/icons/ghost.svg', '/assets/icons/bharatanatyam.svg', '/assets/icons/bhagavad-gita.svg'], color: '#8b5cf6', transliteration: 'bha', pronunciation: 'bha' },
    { char: 'ಮ', name: 'ಮೀನು', icon: ['/assets/icons/fish.svg', '/assets/icons/mysore.svg', '/assets/icons/manipur.svg'], color: '#06b6d4', transliteration: 'ma', pronunciation: 'ma' },
    { char: 'ಯ', name: 'ಯಾನ', icon: ['/assets/icons/car.svg', '/assets/icons/yoga.svg', '/assets/icons/yamuna.svg'], color: '#f97316', transliteration: 'ya', pronunciation: 'ya' },
    { char: 'ರ', name: 'ರವಿ', icon: ['/assets/icons/sun.svg', '/assets/icons/ravi-varna.svg', '/assets/icons/rasam.svg'], color: '#eab308', transliteration: 'ra', pronunciation: 'ra' },
    { char: 'ಲ', name: 'ಲಿಂಬೆ', icon: ['/assets/icons/lemon.svg', '/assets/icons/lakshmi.svg', '/assets/icons/laddu.svg'], color: '#f59e0b', transliteration: 'la', pronunciation: 'la' },
    { char: 'ವ', name: 'ವನ', icon: ['/assets/icons/pine-tree.svg', '/assets/icons/varuna.svg', '/assets/icons/vande-mataram.svg'], color: '#16a34a', transliteration: 'va', pronunciation: 'va' },
    { char: 'ಶ', name: 'ಶಂಖ', icon: ['/assets/icons/conch.svg', '/assets/icons/shankara.svg', '/assets/icons/shimoga.svg'], color: '#f59e0b', transliteration: 'sha', pronunciation: 'sha' },
    { char: 'ಸ', name: 'ಸೂರ್ಯ', icon: ['/assets/icons/sun.svg', '/assets/icons/surya-namaskar.svg', '/assets/icons/sastra.svg'], color: '#f97316', transliteration: 'sa', pronunciation: 'sa' },
    { char: 'ಹ', name: 'ಹಕ್ಕಿ', icon: ['/assets/icons/bird.svg', '/assets/icons/hampi.svg', '/assets/icons/holi.svg'], color: '#3b82f6', transliteration: 'ha', pronunciation: 'ha' },
    { char: 'ಳ', name: 'ಳಂಡ', icon: ['/assets/icons/lizard.svg', '/assets/icons/lanka.svg', '/assets/icons/lord-rama.svg'], color: '#16a34a', transliteration: 'la', pronunciation: 'la (retroflex)' },
  ],
};

// Telugu Alphabet
export const teluguAlphabet: Alphabet = {
  language: 'telugu',
  name: 'తెలుగు (Telugu)',
  letters: [
    // Achulu (Vowels)
    { char: 'అ', name: 'అన్నం', icon: ['/assets/icons/rice.svg', '/assets/icons/andhra-pradesh.svg', '/assets/icons/agni.svg'], color: '#ef4444', transliteration: 'a', pronunciation: 'a as in about' },
    { char: 'ఆ', name: 'ఆవు', icon: ['/assets/icons/cow.svg', '/assets/icons/andhra-cow.svg', '/assets/icons/ashwamedha.svg'], color: '#f59e0b', transliteration: 'aa', pronunciation: 'aa as in father' },
    { char: 'ఇ', name: 'ఇల్లు', icon: ['/assets/icons/house.svg', '/assets/icons/india-gate.svg', '/assets/icons/indigo.svg'], color: '#84cc16', transliteration: 'i', pronunciation: 'i as in sit' },
    { char: 'ఈ', name: 'ఈగ', icon: ['/assets/icons/mosquito.svg', '/assets/icons/indian-ocean.svg', '/assets/icons/indian-eagle.svg'], color: '#16a34a', transliteration: 'ee', pronunciation: 'ee as in feet' },
    { char: 'ఉ', name: 'ఉంగరం', icon: ['/assets/icons/ring.svg', '/assets/icons/udayagiri.svg', '/assets/icons/umbrella.svg'], color: '#a16207', transliteration: 'u', pronunciation: 'u as in put' },
    { char: 'ఊ', name: 'ఊయల', icon: ['/assets/icons/bed.svg', '/assets/icons/ullipaka.svg', '/assets/icons/udupi.svg'], color: '#f97316', transliteration: 'oo', pronunciation: 'oo as in food' },
    { char: 'ఎ', name: 'ఎలుక', icon: ['/assets/icons/mouse.svg', '/assets/icons/ekadri.svg', '/assets/icons/elephant.svg'], color: '#ec4899', transliteration: 'e', pronunciation: 'e as in bed' },
    { char: 'ఏ', name: 'ఏనుగ', icon: ['/assets/icons/elephant.svg', '/assets/icons/ekamran.svg', '/assets/icons/eternal.svg'], color: '#3b82f6', transliteration: 'ae', pronunciation: 'ae as in fair' },
    { char: 'ఐ', name: 'ఐదు', icon: ['/assets/icons/five.svg', '/assets/icons/air-india.svg', '/assets/icons/indian-spice.svg'], color: '#8b5cf6', transliteration: 'ai', pronunciation: 'ai as in fair' },
    { char: 'ఒ', name: 'ఒకటి', icon: ['/assets/icons/one.svg', '/assets/icons/origin.svg', '/assets/icons/orange.svg'], color: '#06b6d4', transliteration: 'o', pronunciation: 'o as in go' },
    { char: 'ఓ', name: 'ఓడ', icon: ['/assets/icons/ship.svg', '/assets/icons/om.svg', '/assets/icons/ocean.svg'], color: '#eab308', transliteration: 'oa', pronunciation: 'oa as in boat' },
    { char: 'ఔ', name: 'ఔషధం', icon: ['/assets/icons/medicine.svg', '/assets/icons/aurangzeb.svg', '/assets/icons/auspicious.svg'], color: '#ef4444', transliteration: 'au', pronunciation: 'au as in how' },
    // Hallulu (Consonants)
    { char: 'క', name: 'కమలం', icon: ['/assets/icons/lotus.svg', '/assets/icons/kakatiya.svg', '/assets/icons/kalam.svg'], color: '#ec4899', transliteration: 'ka', pronunciation: 'ka' },
    { char: 'ఖ', name: 'ఖడ్గం', icon: ['/assets/icons/sword.svg', '/assets/icons/khasi.svg', '/assets/icons/khaki.svg'], color: '#64748b', transliteration: 'kha', pronunciation: 'kha' },
    { char: 'గ', name: 'గొంగళి', icon: ['/assets/icons/conch.svg', '/assets/icons/ganesha.svg', '/assets/icons/ganga.svg'], color: '#f59e0b', transliteration: 'ga', pronunciation: 'ga' },
    { char: 'ఘ', name: 'ఘోడా', icon: ['/assets/icons/horse.svg', '/assets/icons/ghantashala.svg', '/assets/icons/ghazipur.svg'], color: '#a16207', transliteration: 'gha', pronunciation: 'gha' },
    { char: 'చ', name: 'చెర్రీ', icon: ['/assets/icons/cherry.svg', '/assets/icons/charminar.svg', '/assets/icons/chennai.svg'], color: '#dc2626', transliteration: 'cha', pronunciation: 'cha' },
    { char: 'ఛ', name: 'ఛత్రం', icon: ['/assets/icons/umbrella.svg', '/assets/icons/chatur.svg', '/assets/icons/chakra.svg'], color: '#3b82f6', transliteration: 'chha', pronunciation: 'chha' },
    { char: 'జ', name: 'జామ', icon: ['/assets/icons/muskmelon.svg', '/assets/icons/jagannath.svg', '/assets/icons/jasmine.svg'], color: '#f59e0b', transliteration: 'ja', pronunciation: 'ja' },
    { char: 'ఝ', name: 'ఝరి', icon: ['/assets/icons/wave.svg', '/assets/icons/jhoomar.svg', '/assets/icons/zebra.svg'], color: '#06b6d4', transliteration: 'jha', pronunciation: 'jha' },
    { char: 'ట', name: 'టమాటా', icon: ['/assets/icons/tomato.svg', '/assets/icons/tanjavur.svg', '/assets/icons/telangana.svg'], color: '#ef4444', transliteration: 'ta', pronunciation: 'ta (hard)' },
    { char: 'డ', name: 'డ్రాగన్', icon: ['/assets/icons/dragon.svg', '/assets/icons/darbar.svg', '/assets/icons/durga.svg'], color: '#16a34a', transliteration: 'da', pronunciation: 'da (hard)' },
    { char: 'త', name: 'తాటి', icon: ['/assets/icons/palm-tree.svg', '/assets/icons/taj-mahal.svg', '/assets/icons/turmeric.svg'], color: '#eab308', transliteration: 'ta', pronunciation: 'ta (soft)' },
    { char: 'ద', name: 'దోసకాయ', icon: ['/assets/icons/cucumber.svg', '/assets/icons/darjeeling.svg', '/assets/icons/diwali.svg'], color: '#16a34a', transliteration: 'da', pronunciation: 'da (soft)' },
    { char: 'న', name: 'నది', icon: ['/assets/icons/river.svg', '/assets/icons/narmada.svg', '/assets/icons/namaste.svg'], color: '#3b82f6', transliteration: 'na', pronunciation: 'na' },
    { char: 'ప', name: 'పప్పు', icon: ['/assets/icons/peanuts.svg', '/assets/icons/puja.svg', '/assets/icons/pune.svg'], color: '#a855f7', transliteration: 'pa', pronunciation: 'pa' },
    { char: 'ఫ', name: 'ఫలం', icon: ['/assets/icons/apple.svg', '/assets/icons/phoenix.svg', '/assets/icons/phone.svg'], color: '#ef4444', transliteration: 'pha', pronunciation: 'pha' },
    { char: 'బ', name: 'బొమ్మ', icon: ['/assets/icons/doll.svg', '/assets/icons/bangalore.svg', '/assets/icons/brahma.svg'], color: '#ec4899', transliteration: 'ba', pronunciation: 'ba' },
    { char: 'భ', name: 'భూమి', icon: ['/assets/icons/earth.svg', '/assets/icons/bharat.svg', '/assets/icons/bhagavad-gita.svg'], color: '#16a34a', transliteration: 'bha', pronunciation: 'bha' },
    { char: 'మ', name: 'మామిడి', icon: ['/assets/icons/mango.svg', '/assets/icons/mysore.svg', '/assets/icons/maharashtra.svg'], color: '#f59e0b', transliteration: 'ma', pronunciation: 'ma' },
    { char: 'య', name: 'యానాం', icon: ['/assets/icons/car.svg', '/assets/icons/yoga.svg', '/assets/icons/yamuna.svg'], color: '#f97316', transliteration: 'ya', pronunciation: 'ya' },
    { char: 'ర', name: 'రవి', icon: ['/assets/icons/sun.svg', '/assets/icons/ravi-varna.svg', '/assets/icons/rasam.svg'], color: '#eab308', transliteration: 'ra', pronunciation: 'ra' },
    { char: 'ల', name: 'లింబు', icon: ['/assets/icons/lemon.svg', '/assets/icons/lakshmi.svg', '/assets/icons/laddu.svg'], color: '#84cc16', transliteration: 'la', pronunciation: 'la' },
    { char: 'వ', name: 'వనం', icon: ['/assets/icons/tree.svg', '/assets/icons/varuna.svg', '/assets/icons/vande-mataram.svg'], color: '#16a34a', transliteration: 'va', pronunciation: 'va' },
    { char: 'శ', name: 'శంఖు', icon: ['/assets/icons/conch.svg', '/assets/icons/shankara.svg', '/assets/icons/shimoga.svg'], color: '#f59e0b', transliteration: 'sha', pronunciation: 'sha' },
    { char: 'స', name: 'సూర్యుడు', icon: ['/assets/icons/sun.svg', '/assets/icons/surya-namaskar.svg', '/assets/icons/sastra.svg'], color: '#f97316', transliteration: 'sa', pronunciation: 'sa' },
    { char: 'హ', name: 'హంస', icon: ['/assets/icons/swan.svg', '/assets/icons/hampi.svg', '/assets/icons/holi.svg'], color: '#fff', transliteration: 'ha', pronunciation: 'ha' },
  ],
};

// Tamil Alphabet
export const tamilAlphabet: Alphabet = {
  language: 'tamil',
  name: 'தமிழ் (Tamil)',
  letters: [
    // Uyir Ezhuthukkal (Vowels)
    { char: 'அ', name: 'அப்பம்', icon: ['/assets/icons/pancake.svg', '/assets/icons/andhra.svg', '/assets/icons/agni.svg'], color: '#ef4444', transliteration: 'a', pronunciation: 'a as in about' },
    { char: 'ஆ', name: 'ஆமை', icon: ['/assets/icons/tortoise.svg', '/assets/icons/adyar.svg', '/assets/icons/agniyar.svg'], color: '#16a34a', transliteration: 'aa', pronunciation: 'aa as in father' },
    { char: 'இ', name: 'இலை', icon: ['/assets/icons/leaf.svg', '/assets/icons/india-gate.svg', '/assets/icons/indigo.svg'], color: '#84cc16', transliteration: 'i', pronunciation: 'i as in sit' },
    { char: 'ஈ', name: 'ஈச்சம்', icon: ['/assets/icons/palm-tree.svg', '/assets/icons/indian-ocean.svg', '/assets/icons/indira-gandhi.svg'], color: '#a16207', transliteration: 'ee', pronunciation: 'ee as in feet' },
    { char: 'உ', name: 'உடும்பு', icon: ['/assets/icons/lizard.svg', '/assets/icons/udupi.svg', '/assets/icons/umbrella.svg'], color: '#16a34a', transliteration: 'u', pronunciation: 'u as in put' },
    { char: 'ஊ', name: 'ஊசி', icon: ['/assets/icons/needle.svg', '/assets/icons/ullu.svg', '/assets/icons/uttam.svg'], color: '#64748b', transliteration: 'oo', pronunciation: 'oo as in food' },
    { char: 'எ', name: 'எலி', icon: ['/assets/icons/mouse.svg', '/assets/icons/ekam.svg', '/assets/icons/elephant.svg'], color: '#a16207', transliteration: 'e', pronunciation: 'e as in bed' },
    { char: 'ஏ', name: 'ஏணி', icon: ['/assets/icons/ladder.svg', '/assets/icons/erode.svg', '/assets/icons/eternal.svg'], color: '#f59e0b', transliteration: 'ae', pronunciation: 'ae as in fair' },
    { char: 'ஐ', name: 'ஐந்து', icon: ['/assets/icons/five.svg', '/assets/icons/air-india.svg', '/assets/icons/indian-spice.svg'], color: '#3b82f6', transliteration: 'ai', pronunciation: 'ai as in fair' },
    { char: 'ஒ', name: 'ஒட்டகம்', icon: ['/assets/icons/camel.svg', '/assets/icons/origin.svg', '/assets/icons/om.svg'], color: '#eab308', transliteration: 'o', pronunciation: 'o as in go' },
    { char: 'ஓ', name: 'ஓடம்', icon: ['/assets/icons/boat.svg', '/assets/icons/om-sai-ram.svg', '/assets/icons/ocean.svg'], color: '#06b6d4', transliteration: 'oa', pronunciation: 'oa as in boat' },
    { char: 'ஔ', name: 'ஔவை', icon: ['/assets/icons/grandma.svg', '/assets/icons/aurum.svg', '/assets/icons/auspicious.svg'], color: '#8b5cf6', transliteration: 'au', pronunciation: 'au as in how' },
    // Mei Ezhuthukkal (Consonants)
    { char: 'க', name: 'கமலம்', icon: ['/assets/icons/lotus.svg', '/assets/icons/kanchipuram.svg', '/assets/icons/kala.svg'], color: '#ec4899', transliteration: 'ka', pronunciation: 'ka' },
    { char: 'ங', name: 'ங', icon: ['/assets/icons/bell.svg', '/assets/icons/nga.svg', '/assets/icons/nagpur.svg'], color: '#eab308', transliteration: 'nga', pronunciation: 'nga' },
    { char: 'ச', name: 'சக்கரம்', icon: ['/assets/icons/wheel.svg', '/assets/icons/chennai.svg', '/assets/icons/chettinad.svg'], color: '#f59e0b', transliteration: 'cha', pronunciation: 'cha' },
    { char: 'ஞ', name: 'ஞாயிறு', icon: ['/assets/icons/sun.svg', '/assets/icons/nyam.svg', '/assets/icons/nayanthara.svg'], color: '#f97316', transliteration: 'nya', pronunciation: 'nya' },
    { char: 'ட', name: 'டம்ரூ', icon: ['/assets/icons/drum.svg', '/assets/icons/tambur.svg', '/assets/icons/tamil-rock.svg'], color: '#a16207', transliteration: 'ta', pronunciation: 'ta (hard)' },
    { char: 'ண', name: 'ணவாய்', icon: ['/assets/icons/trident.svg', '/assets/icons/nag.svg', '/assets/icons/narthaki.svg'], color: '#eab308', transliteration: 'na', pronunciation: 'na (hard)' },
    { char: 'த', name: 'தங்கம்', icon: ['/assets/icons/gold.svg', '/assets/icons/tanjore.svg', '/assets/icons/tamil-isai.svg'], color: '#eab308', transliteration: 'tha', pronunciation: 'tha' },
    { char: 'ந', name: 'நந்தி', icon: ['/assets/icons/ox.svg', '/assets/icons/namakkal.svg', '/assets/icons/namaste.svg'], color: '#a16207', transliteration: 'na', pronunciation: 'na' },
    { char: 'ப', name: 'பழம்', icon: ['/assets/icons/apple.svg', '/assets/icons/puducherry.svg', '/assets/icons/palkhi.svg'], color: '#ef4444', transliteration: 'pa', pronunciation: 'pa' },
    { char: 'ம', name: 'மாம்பழம்', icon: ['/assets/icons/mango.svg', '/assets/icons/madurai.svg', '/assets/icons/maharani.svg'], color: '#f59e0b', transliteration: 'ma', pronunciation: 'ma' },
    { char: 'ய', name: 'யானை', icon: ['/assets/icons/elephant.svg', '/assets/icons/yazh.svg', '/assets/icons/yoga.svg'], color: '#64748b', transliteration: 'ya', pronunciation: 'ya' },
    { char: 'ர', name: 'ரதம்', icon: ['/assets/icons/auto.svg', '/assets/icons/ramayan.svg', '/assets/icons/rangoli.svg'], color: '#f97316', transliteration: 'ra', pronunciation: 'ra' },
    { char: 'ல', name: 'லிங்கம்', icon: ['/assets/icons/bell.svg', '/assets/icons/lalitha.svg', '/assets/icons/lakshmi.svg'], color: '#eab308', transliteration: 'la', pronunciation: 'la' },
    { char: 'வ', name: 'வண்டி', icon: ['/assets/icons/car.svg', '/assets/icons/valluvar.svg', '/assets/icons/viluppuram.svg'], color: '#ef4444', transliteration: 'va', pronunciation: 'va' },
    { char: 'ழ', name: 'ழல', icon: ['/assets/icons/fire.svg', '/assets/icons/zamin.svg', '/assets/icons/zebra.svg'], color: '#f97316', transliteration: 'zha', pronunciation: 'zha (retroflex)' },
    { char: 'ள', name: 'ளவு', icon: ['/assets/icons/ruler.svg', '/assets/icons/lalgudi.svg', '/assets/icons/lord-ayyar.svg'], color: '#3b82f6', transliteration: 'la', pronunciation: 'la (retroflex)' },
    { char: 'ற', name: 'றவு', icon: ['/assets/icons/wave.svg', '/assets/icons/tarangam.svg', '/assets/icons/trichy.svg'], color: '#06b6d4', transliteration: 'ra', pronunciation: 'ra (trilled)' },
    { char: 'ன', name: 'ன', icon: ['/assets/icons/bell.svg', '/assets/icons/nanganallur.svg', '/assets/icons/nataraja.svg'], color: '#64748b', transliteration: 'na', pronunciation: 'na (soft)' },
  ],
};

// All alphabets
export const alphabets: Record<string, Alphabet> = {
  en: englishAlphabet,
  hi: hindiAlphabet,
  kn: kannadaAlphabet,
  te: teluguAlphabet,
  ta: tamilAlphabet,
  // Legacy mappings for backward compatibility
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
