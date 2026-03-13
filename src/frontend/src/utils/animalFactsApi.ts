/**
 * Animal Facts API Utility
 *
 * Fetches real animal facts from public APIs with localStorage caching.
 * Provides fallback facts when APIs are unavailable.
 */

const FACTS_CACHE_KEY = 'farm_friends_animal_facts_cache';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedFact {
  fact: string;
  timestamp: number;
}

interface FactsCache {
  [animalId: string]: CachedFact;
}

// Fallback facts for each animal (kid-friendly)
const FALLBACK_FACTS: Record<string, string[]> = {
  cow: [
    'Cows have best friends and get stressed when separated!',
    'A cow can produce up to 8 gallons of milk per day.',
    'Cows have four stomachs to help them digest grass.',
    'Cows can smell things from 6 miles away!',
    'A group of cows is called a herd.',
  ],
  pig: [
    'Pigs are very smart - smarter than dogs!',
    'Pigs can\'t sweat, so they roll in mud to cool off.',
    'A pig\'s squeal can be louder than a jet engine!',
    'Pigs dream when they sleep, just like humans!',
    'Pigs can learn tricks faster than dogs!',
  ],
  chicken: [
    'Chickens can recognize over 100 different faces!',
    'A mother hen turns her eggs about 50 times a day.',
    'Chickens can run up to 9 miles per hour!',
    'Chickens have better color vision than humans!',
    'Chickens talk to their chicks while they are still in the egg!',
  ],
  dog: [
    'Dogs have about 300 million scent receptors in their noses!',
    'A dog\'s nose print is unique, like a human fingerprint.',
    'Dogs can understand over 100 words and gestures.',
    'The Basenji dog doesn\'t bark - it yodels!',
    'Dogs curl up when sleeping to protect their organs!',
  ],
  cat: [
    'Cats sleep for 12-16 hours a day!',
    'A group of cats is called a clowder.',
    'Cats can rotate their ears 180 degrees!',
    'A cat\'s nose print is unique, like a human fingerprint.',
    'Cats have five toes on front paws but only four on back paws!',
  ],
  sheep: [
    'Sheep have rectangular pupils that give them 270-degree vision!',
    'A group of sheep is called a flock.',
    'Sheep can remember up to 50 faces for over 2 years!',
    'There are over 1 billion sheep in the world!',
    'Sheep have excellent hearing and can turn their ears to hear better!',
  ],
};

// Get a random fallback fact for an animal
function getFallbackFact(animalId: string): string {
  const facts = FALLBACK_FACTS[animalId] || ['This animal is amazing!'];
  return facts[Math.floor(Math.random() * facts.length)];
}

// Fetch a random cat fact from API
async function fetchCatFact(): Promise<string | null> {
  try {
    const response = await fetch('https://cat-fact.herokuapp.com/facts/random?animal_type=cat&amount=1');
    if (!response.ok) throw new Error('Failed to fetch cat fact');
    const data = await response.json();
    return data.text || null;
  } catch {
    return null;
  }
}

// Fetch a random dog fact from API
async function fetchDogFact(): Promise<string | null> {
  try {
    const response = await fetch('https://dogapi.dog/api/v2/facts?limit=1');
    if (!response.ok) throw new Error('Failed to fetch dog fact');
    const data = await response.json();
    return data.data?.[0]?.attributes?.body || null;
  } catch {
    return null;
  }
}

/**
 * Get a fun fact about an animal
 * Tries API first (for cats and dogs), falls back to local facts
 * Results are cached in localStorage for 24 hours
 */
export async function getAnimalFact(animalId: string): Promise<string> {
  // Check cache first
  try {
    const cached = localStorage.getItem(FACTS_CACHE_KEY);
    if (cached) {
      const cache: FactsCache = JSON.parse(cached);
      const entry = cache[animalId];
      if (entry && Date.now() - entry.timestamp < CACHE_EXPIRY_MS) {
        return entry.fact;
      }
    }
  } catch {
    // Ignore localStorage errors
  }

  // Try to fetch from API for cats and dogs
  let fact: string | null = null;

  if (animalId === 'cat') {
    fact = await fetchCatFact();
  } else if (animalId === 'dog') {
    fact = await fetchDogFact();
  }

  // Use fallback if API fails or for other animals
  if (!fact) {
    fact = getFallbackFact(animalId);
  }

  // Save to cache
  try {
    const cached = localStorage.getItem(FACTS_CACHE_KEY);
    const cache: FactsCache = cached ? JSON.parse(cached) : {};
    cache[animalId] = { fact, timestamp: Date.now() };
    localStorage.setItem(FACTS_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore localStorage errors
  }

  return fact;
}

/**
 * Get multiple facts about an animal
 * Useful for the standalone AnimalFacts component
 */
export async function getMultipleAnimalFacts(animalId: string, count: number = 5): Promise<string[]> {
  const facts: string[] = [];
  const fallbacks = FALLBACK_FACTS[animalId] || ['This animal is amazing!'];

  // For cats and dogs, try to get one API fact
  if (animalId === 'cat') {
    const apiFact = await fetchCatFact();
    if (apiFact) facts.push(apiFact);
  } else if (animalId === 'dog') {
    const apiFact = await fetchDogFact();
    if (apiFact) facts.push(apiFact);
  }

  // Fill the rest with fallback facts (randomized)
  const shuffled = [...fallbacks].sort(() => Math.random() - 0.5);
  while (facts.length < count && shuffled.length > 0) {
    const fact = shuffled.pop();
    if (fact && !facts.includes(fact)) {
      facts.push(fact);
    }
  }

  return facts.slice(0, count);
}

/**
 * Clear the facts cache
 */
export function clearFactsCache(): void {
  try {
    localStorage.removeItem(FACTS_CACHE_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Check if a fact is cached for an animal
 */
export function isFactCached(animalId: string): boolean {
  try {
    const cached = localStorage.getItem(FACTS_CACHE_KEY);
    if (!cached) return false;
    const cache: FactsCache = JSON.parse(cached);
    const entry = cache[animalId];
    return !!entry && Date.now() - entry.timestamp < CACHE_EXPIRY_MS;
  } catch {
    return false;
  }
}
