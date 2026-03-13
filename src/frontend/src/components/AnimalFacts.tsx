/**
 * Animal Facts Component
 *
 * Learn real animal trivia from fun facts API!
 *
 * Features:
 * - Fetches real animal facts from API
 * - Caches facts in localStorage
 * - Kid-friendly UI with emoji animals
 * - Text-to-speech support
 */

import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTTS } from '../hooks/useTTS';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import { getMultipleAnimalFacts } from '../utils/animalFactsApi';

// Animal type with emoji mapping
interface AnimalType {
  id: string;
  name: string;
  emoji: string;
  category: 'pet' | 'farm' | 'wild' | 'ocean';
}

const ANIMALS: AnimalType[] = [
  // Pets
  { id: 'cat', name: 'Cat', emoji: '🐱', category: 'pet' },
  { id: 'dog', name: 'Dog', emoji: '🐶', category: 'pet' },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰', category: 'pet' },
  { id: 'hamster', name: 'Hamster', emoji: '🐹', category: 'pet' },
  // Farm
  { id: 'cow', name: 'Cow', emoji: '🐄', category: 'farm' },
  { id: 'pig', name: 'Pig', emoji: '🐷', category: 'farm' },
  { id: 'chicken', name: 'Chicken', emoji: '🐔', category: 'farm' },
  { id: 'sheep', name: 'Sheep', emoji: '🐑', category: 'farm' },
  { id: 'horse', name: 'Horse', emoji: '🐴', category: 'farm' },
  // Wild
  { id: 'lion', name: 'Lion', emoji: '🦁', category: 'wild' },
  { id: 'tiger', name: 'Tiger', emoji: '🐯', category: 'wild' },
  { id: 'elephant', name: 'Elephant', emoji: '🐘', category: 'wild' },
  { id: 'giraffe', name: 'Giraffe', emoji: '🦒', category: 'wild' },
  { id: 'monkey', name: 'Monkey', emoji: '🐵', category: 'wild' },
  { id: 'bear', name: 'Bear', emoji: '🐻', category: 'wild' },
  { id: 'panda', name: 'Panda', emoji: '🐼', category: 'wild' },
  { id: 'fox', name: 'Fox', emoji: '🦊', category: 'wild' },
  { id: 'koala', name: 'Koala', emoji: '🐨', category: 'wild' },
  // Ocean
  { id: 'whale', name: 'Whale', emoji: '🐋', category: 'ocean' },
  { id: 'dolphin', name: 'Dolphin', emoji: '🐬', category: 'ocean' },
  { id: 'octopus', name: 'Octopus', emoji: '🐙', category: 'ocean' },
  { id: 'fish', name: 'Fish', emoji: '🐠', category: 'ocean' },
  { id: 'shark', name: 'Shark', emoji: '🦈', category: 'ocean' },
];


interface AnimalFactsProps {
  /** Optional callback when an animal is selected */
  onAnimalSelect?: (animal: AnimalType) => void;
  /** Optional initial category filter */
  initialCategory?: 'all' | 'pet' | 'farm' | 'wild' | 'ocean';
}

function AnimalFactsComponent({ onAnimalSelect, initialCategory = 'all' }: AnimalFactsProps) {
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType | null>(null);
  const [facts, setFacts] = useState<string[]>([]);
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState(initialCategory);
  const [showFactModal, setShowFactModal] = useState(false);
  
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { playClick, playSuccess, playPop } = useAudio();

  const filteredAnimals = category === 'all' 
    ? ANIMALS 
    : ANIMALS.filter(a => a.category === category);

  const handleAnimalClick = useCallback(async (animal: AnimalType) => {
    playClick();
    triggerHaptic('success');
    setSelectedAnimal(animal);
    setShowFactModal(true);
    setIsLoading(true);
    setCurrentFactIndex(0);
    
    onAnimalSelect?.(animal);

    const animalFacts = await getMultipleAnimalFacts(animal.id, 5);
    setFacts(animalFacts);
    setIsLoading(false);

    // Auto-read first fact if TTS is enabled
    if (ttsEnabled && animalFacts.length > 0) {
      speak(`Did you know? ${animalFacts[0]}`);
    }
  }, [onAnimalSelect, playClick, speak, ttsEnabled]);

  const handleNextFact = useCallback(() => {
    playPop();
    const newIndex = (currentFactIndex + 1) % facts.length;
    setCurrentFactIndex(newIndex);
    if (ttsEnabled) {
      speak(`Did you know? ${facts[newIndex]}`);
    }
  }, [currentFactIndex, facts, playPop, speak, ttsEnabled]);

  const handlePrevFact = useCallback(() => {
    playPop();
    const newIndex = currentFactIndex === 0 ? facts.length - 1 : currentFactIndex - 1;
    setCurrentFactIndex(newIndex);
    if (ttsEnabled) {
      speak(`Did you know? ${facts[newIndex]}`);
    }
  }, [currentFactIndex, facts, playPop, speak, ttsEnabled]);

  const handleCloseModal = useCallback(() => {
    playClick();
    setShowFactModal(false);
    setTimeout(() => setSelectedAnimal(null), 300);
  }, [playClick]);

  const handleCategoryChange = useCallback((newCategory: typeof category) => {
    playClick();
    setCategory(newCategory);
  }, [playClick]);

  const speakCurrentFact = useCallback(() => {
    if (facts.length > 0 && ttsEnabled) {
      playSuccess();
      speak(`Did you know? ${facts[currentFactIndex]}`);
    }
  }, [facts, currentFactIndex, ttsEnabled, speak, playSuccess]);

  const categories = [
    { id: 'all', label: 'All', emoji: '🌍' },
    { id: 'pet', label: 'Pets', emoji: '🏠' },
    { id: 'farm', label: 'Farm', emoji: '🚜' },
    { id: 'wild', label: 'Wild', emoji: '🌴' },
    { id: 'ocean', label: 'Ocean', emoji: '🌊' },
  ] as const;

  return (
    <div className="w-full h-full flex flex-col p-4">
      {/* Header */}
      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-5xl mb-2"
        >
          🦁
        </motion.div>
        <h2 className="text-2xl font-black text-blue-600 mb-1">
          Animal Facts!
        </h2>
        <p className="text-sm text-blue-500">
          Tap an animal to learn something amazing!
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${
              category === cat.id
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            <span className="mr-1">{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Animal Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {filteredAnimals.map((animal, index) => (
            <motion.button
              key={animal.id}
              type="button"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnimalClick(animal)}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 transition-all ${
                selectedAnimal?.id === animal.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white hover:bg-blue-50 shadow-md'
              }`}
            >
              <span className="text-4xl mb-1">{animal.emoji}</span>
              <span className={`text-xs font-bold ${
                selectedAnimal?.id === animal.id ? 'text-white' : 'text-gray-700'
              }`}>
                {animal.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Fact Modal */}
      <AnimatePresence>
        {showFactModal && selectedAnimal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="text-center mb-4">
                <span className="text-6xl">{selectedAnimal.emoji}</span>
                <h3 className="text-2xl font-black text-blue-600 mt-2">
                  {selectedAnimal.name}
                </h3>
              </div>

              {/* Fact Content */}
              <div className="bg-blue-50 rounded-2xl p-4 mb-4 min-h-[100px] flex items-center justify-center">
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-4xl"
                  >
                    🌀
                  </motion.div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentFactIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="text-lg font-bold text-blue-700 text-center"
                    >
                      {facts[currentFactIndex]}
                    </motion.p>
                  </AnimatePresence>
                )}
              </div>

              {/* Fact Counter */}
              {!isLoading && facts.length > 1 && (
                <div className="flex justify-center gap-2 mb-4">
                  {facts.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        idx === currentFactIndex ? 'bg-blue-500' : 'bg-blue-200'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-2">
                {facts.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevFact}
                      className="flex-1 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-bold transition-all"
                    >
                      ← Prev
                    </button>
                    <button
                      type="button"
                      onClick={handleNextFact}
                      className="flex-1 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-bold transition-all"
                    >
                      Next →
                    </button>
                  </>
                )}
              </div>

              {/* Read Aloud Button */}
              <button
                type="button"
                onClick={speakCurrentFact}
                disabled={isLoading || !ttsEnabled}
                className="w-full mt-2 py-3 bg-green-100 hover:bg-green-200 disabled:bg-gray-100 text-green-700 disabled:text-gray-400 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <span>🔊</span>
                {ttsEnabled ? 'Read Aloud' : 'Voice Off'}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full mt-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const AnimalFacts = memo(AnimalFactsComponent);
export default AnimalFacts;
