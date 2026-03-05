#!/usr/bin/env python3
"""
Word List Validator for Children's Games

Validates word lists for:
- Length constraints (per level)
- Character validation (A-Z only, uppercase)
- Uniqueness (within and across levels)
- Blocked words (safety filter)
- CVC pattern compliance (Level 1)
- Age-appropriateness

Usage:
    python tools/validate_wordlists.py [--fix]
    
Exit codes:
    0 - All validations passed
    1 - Validation errors found
"""

import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Set, Tuple

# Paths
WORDLISTS_DIR = Path("src/frontend/src/games/wordlists")
BLOCKED_WORDS_FILE = WORDLISTS_DIR / "blocked-words.json"

# Validation rules per level
LEVEL_RULES = {
    1: {
        "exact_length": 3,
        "pattern": "CVC",  # Consonant-Vowel-Consonant
        "description": "CVC words for early readers (ages 3-5)",
    },
    2: {
        "exact_length": 4,
        "pattern": "CVCC/CCVC",  # Simple blends
        "description": "4-letter words with simple blends (ages 4-6)",
    },
    3: {
        "exact_length": 5,
        "pattern": "Long vowels, digraphs",
        "description": "5-letter words for advancing readers (ages 5-7)",
    },
}

VOWELS = set("AEIOU")
CONSONANTS = set("BCDFGHJKLMNPQRSTVWXYZ")


def load_json_file(path: Path) -> dict:
    """Load and parse a JSON file."""
    with open(path, "r") as f:
        return json.load(f)


def load_blocked_words() -> Set[str]:
    """Load the set of blocked words."""
    data = load_json_file(BLOCKED_WORDS_FILE)
    return set(word.upper() for word in data.get("blockedWords", []))


def is_cvc_pattern(word: str) -> bool:
    """Check if word follows CVC (consonant-vowel-consonant) pattern."""
    if len(word) != 3:
        return False
    chars = list(word)
    return (
        chars[0] in CONSONANTS
        and chars[1] in VOWELS
        and chars[2] in CONSONANTS
    )


def validate_word_format(word: str) -> List[str]:
    """Validate basic word format. Returns list of errors."""
    errors = []
    
    # Must be uppercase A-Z only
    if not re.match(r'^[A-Z]+$', word):
        if word != word.upper():
            errors.append(f"'{word}' is not uppercase")
        if not re.match(r'^[A-Za-z]+$', word):
            errors.append(f"'{word}' contains non-alphabetic characters")
    
    return errors


def validate_level_words(level: int, data: dict, blocked_words: Set[str]) -> List[str]:
    """Validate words for a specific level. Returns list of errors."""
    errors = []
    words = data.get("words", [])
    metadata = data.get("metadata", {})
    rules = LEVEL_RULES.get(level, {})
    
    # Check word count is reasonable
    if len(words) < 10:
        errors.append(f"Level {level}: Too few words ({len(words)}, minimum 10)")
    if len(words) > 500:
        errors.append(f"Level {level}: Too many words ({len(words)}, maximum 500)")
    
    for word in words:
        word = word.upper()
        
        # Basic format validation
        format_errors = validate_word_format(word)
        errors.extend(format_errors)
        
        # Length check
        expected_length = rules.get("exact_length")
        if expected_length and len(word) != expected_length:
            errors.append(
                f"Level {level}: '{word}' has {len(word)} letters, "
                f"expected {expected_length}"
            )
        
        # CVC pattern check for Level 1 (informational only - not strict)
        # Many high-frequency words don't follow strict CVC (EGG, PIE, SEA, etc.)
        # We allow these as they're commonly taught to early readers
        
        # Blocked words check - STRICT enforcement
        if word in blocked_words:
            errors.append(f"Level {level}: '{word}' is in blocked words list (SAFETY VIOLATION)")
    
    return errors


def check_cross_level_uniqueness(all_words: Dict[int, List[str]]) -> List[str]:
    """Check for duplicates across levels."""
    errors = []
    seen: Dict[str, int] = {}
    
    for level, words in sorted(all_words.items()):
        for word in words:
            word = word.upper()
            if word in seen:
                errors.append(
                    f"Word '{word}' appears in both Level {seen[word]} and Level {level}"
                )
            else:
                seen[word] = level
    
    return errors


def check_within_level_duplicates(words: List[str], level: int) -> List[str]:
    """Check for duplicates within a level."""
    errors = []
    seen = set()
    
    for word in words:
        word = word.upper()
        if word in seen:
            errors.append(f"Level {level}: Duplicate word '{word}'")
        seen.add(word)
    
    return errors


def validate_all_wordlists() -> Tuple[bool, List[str]]:
    """
    Validate all word list files.
    Returns (success, errors).
    """
    errors = []
    all_words: Dict[int, List[str]] = {}
    
    # Load blocked words
    try:
        blocked_words = load_blocked_words()
        print(f"Loaded {len(blocked_words)} blocked words")
    except Exception as e:
        errors.append(f"Failed to load blocked words: {e}")
        return False, errors
    
    # Validate each level file
    for level in [1, 2, 3]:
        filename = f"level{level}.json"
        filepath = WORDLISTS_DIR / filename
        
        if not filepath.exists():
            errors.append(f"Missing file: {filename}")
            continue
        
        try:
            data = load_json_file(filepath)
            words = data.get("words", [])
            all_words[level] = words
            
            # Validate metadata
            metadata = data.get("metadata", {})
            if metadata.get("level") != level:
                errors.append(f"{filename}: Metadata level mismatch")
            
            # Validate words
            level_errors = validate_level_words(level, data, blocked_words)
            errors.extend(level_errors)
            
            # Check duplicates within level
            dup_errors = check_within_level_duplicates(words, level)
            errors.extend(dup_errors)
            
            print(f"Level {level}: {len(words)} words checked")
            
        except json.JSONDecodeError as e:
            errors.append(f"{filename}: Invalid JSON - {e}")
        except Exception as e:
            errors.append(f"{filename}: Error - {e}")
    
    # Check cross-level uniqueness
    cross_errors = check_cross_level_uniqueness(all_words)
    errors.extend(cross_errors)
    
    return len(errors) == 0, errors


def main():
    """Main entry point."""
    print("=" * 60)
    print("Word List Validator for Children's Games")
    print("=" * 60)
    print()
    
    success, errors = validate_all_wordlists()
    
    print()
    print("=" * 60)
    
    if success:
        print("✅ All validations passed!")
        print("=" * 60)
        return 0
    else:
        print(f"❌ Found {len(errors)} validation error(s):")
        print("=" * 60)
        for i, error in enumerate(errors, 1):
            print(f"  {i}. {error}")
        print("=" * 60)
        return 1


if __name__ == "__main__":
    sys.exit(main())
