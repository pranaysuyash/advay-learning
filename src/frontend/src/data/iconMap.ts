// Icon mapping for emoji replacement
// Maps emoji characters to SVG icon paths

export const iconMap: Record<string, string> = {
  // English alphabet
  '🍎': '/assets/icons/apple.svg',
  '⚽': '/assets/icons/ball.svg',
  '🐱': '/assets/icons/cat.svg',
  '🐕': '/assets/icons/dog.svg',
  '🐘': '/assets/icons/elephant.svg',
  '🐟': '/assets/icons/fish.svg',
  '🍇': '/assets/icons/grapes.svg',
  '🏠': '/assets/icons/house.svg',
  '🍦': '/assets/icons/ice-cream.svg',
  '🧃': '/assets/icons/juice.svg',
  '🪁': '/assets/icons/kite.svg',
  '🦁': '/assets/icons/lion.svg',
  '🌙': '/assets/icons/moon.svg',
  '🪺': '/assets/icons/nest.svg',
  '🍊': '/assets/icons/orange.svg',
  '✏️': '/assets/icons/pencil.svg',
  '👸': '/assets/icons/queen.svg',
  '🌈': '/assets/icons/rainbow.svg',
  '☀️': '/assets/icons/sun.svg',
  '🌳': '/assets/icons/tree.svg',
  '☂️': '/assets/icons/umbrella.svg',
  '🎻': '/assets/icons/violin.svg',
  '🍉': '/assets/icons/watermelon.svg',
  '🎹': '/assets/icons/xylophone.svg',
  '⛵': '/assets/icons/yacht.svg',
  '🦓': '/assets/icons/zebra.svg',

  // Hindi and other languages
  '🥭': '/assets/icons/mango.svg',
  '🌿': '/assets/icons/tamarind.svg',
  '🎋': '/assets/icons/sugarcane.svg',
  '🦉': '/assets/icons/owl.svg',
  '🧶': '/assets/icons/yarn.svg',
  '🦶': '/assets/icons/foot.svg',
  '👓': '/assets/icons/glasses.svg',
  '🥣': '/assets/icons/mortar.svg',
  '👩': '/assets/icons/woman.svg',
  '🕊️': '/assets/icons/dove.svg',
  '🐰': '/assets/icons/rabbit.svg',
  '🐄': '/assets/icons/cow.svg',
  '🕐': '/assets/icons/clock.svg',
  '🥄': '/assets/icons/spoon.svg',
  '🚢': '/assets/icons/ship.svg',
  '🚩': '/assets/icons/flag.svg',
  '🍅': '/assets/icons/tomato.svg',
  '🥁': '/assets/icons/drum.svg',
  '🖋️': '/assets/icons/fountain-pen.svg',
  '🚰': '/assets/icons/tap.svg',
  '🦆': '/assets/icons/duck.svg',
  '🐻': '/assets/icons/bear.svg',
  '🔥': '/assets/icons/fire.svg',
  '🛺': '/assets/icons/auto.svg',
  '🟡': '/assets/icons/laddu.svg',
  '🦢': '/assets/icons/swan.svg',
  '🥔': '/assets/icons/potato.svg',

  // Kannada specific
  '🐚': '/assets/icons/conch.svg',
  '🙏': '/assets/icons/prayer.svg',
  '🧂': '/assets/icons/salt.svg',
  '🍽️': '/assets/icons/food.svg',
  '🍃': '/assets/icons/leaf.svg',
  '🪜': '/assets/icons/ladder.svg',
  '5️⃣': '/assets/icons/five.svg',
  '🌾': '/assets/icons/farm.svg',
  '🏃': '/assets/icons/run.svg',
  '💊': '/assets/icons/medicine.svg',
  '⬛': '/assets/icons/square.svg',
  '⚔️': '/assets/icons/sword.svg',
  '🪴': '/assets/icons/plant.svg',
  '🐴': '/assets/icons/horse.svg',
  '💧': '/assets/icons/honey.svg',
  '🌊': '/assets/icons/wave.svg',
  '🏞️': '/assets/icons/river.svg',
  '📚': '/assets/icons/book.svg',
  '🍯': '/assets/icons/honey.svg',
  '🍌': '/assets/icons/banana.svg',
  '👻': '/assets/icons/ghost.svg',
  '🚗': '/assets/icons/car.svg',
  '🍋': '/assets/icons/lemon.svg',
  '🌲': '/assets/icons/pine-tree.svg',
  '🐦': '/assets/icons/bird.svg',
  '🦎': '/assets/icons/lizard.svg',

  // Telugu specific
  '🍚': '/assets/icons/rice.svg',
  '🦟': '/assets/icons/mosquito.svg',
  '💍': '/assets/icons/ring.svg',
  '🛏️': '/assets/icons/bed.svg',
  '🐁': '/assets/icons/mouse.svg',
  '🪷': '/assets/icons/lotus.svg',
  '🍒': '/assets/icons/cherry.svg',
  '🍈': '/assets/icons/muskmelon.svg',
  '🐉': '/assets/icons/dragon.svg',
  '🥒': '/assets/icons/cucumber.svg',
  '🥜': '/assets/icons/peanuts.svg',
  '🪆': '/assets/icons/doll.svg',
  '🌍': '/assets/icons/earth.svg',

  // Additional icons
  '🍏': '/assets/icons/apple-green.svg',
  '⛰️': '/assets/icons/mountain.svg',
  
// Tamil specific
  '🥞': '/assets/icons/pancake.svg',
  '🐢': '/assets/icons/tortoise.svg',
  '🪡': '/assets/icons/needle.svg',
  '🐪': '/assets/icons/camel.svg',
  '👵': '/assets/icons/grandma.svg',
  '🔔': '/assets/icons/bell.svg',
  '☸️': '/assets/icons/wheel.svg',
  '🔱': '/assets/icons/trident.svg',
  '🥇': '/assets/icons/gold.svg',
  '🐂': '/assets/icons/ox.svg',
  '🚣': '/assets/icons/boat.svg',
  '📏': '/assets/icons/ruler.svg',
  '1️⃣': '/assets/icons/one.svg',
};

// Helper function to get icon path for an emoji
export function getIconPath(emoji: string): string | undefined {
  return iconMap[emoji];
}

// Helper function to check if an emoji has an icon
export function hasIcon(emoji: string): boolean {
  return emoji in iconMap;
}
