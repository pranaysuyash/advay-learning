/**
 * Utility functions for handling icons in the learning app
 */

import { Letter } from '../data/alphabets';

/**
 * Randomly selects an icon from the available options for a letter
 * @param letter - The letter object that may contain a single icon or multiple icons
 * @returns A single icon path string
 */
export function getRandomIcon(letter: Letter): string {
  if (typeof letter.icon === 'string') {
    return letter.icon;
  } else if (Array.isArray(letter.icon) && letter.icon.length > 0) {
    const randomIndex = Math.floor(Math.random() * letter.icon.length);
    return letter.icon[randomIndex];
  } else {
    // Fallback to a default icon if none are available
    return '/assets/icons/default.svg';
  }
}

/**
 * Gets all available icons for a letter
 * @param letter - The letter object that may contain a single icon or multiple icons
 * @returns An array of icon paths
 */
export function getAllIcons(letter: Letter): string[] {
  if (typeof letter.icon === 'string') {
    return [letter.icon];
  } else if (Array.isArray(letter.icon)) {
    return [...letter.icon]; // Return a copy of the array
  } else {
    return [];
  }
}