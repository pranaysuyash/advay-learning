#!/usr/bin/env python3
"""
Word Bank Validator for Children's Games

Validates:
- Word bank structure and schema
- All words have required tags
- No blocked words
- Curriculum stages are valid and non-empty
- Tag values are from allowed enums

Usage:
    python tools/validate_wordbank.py
    
Exit codes:
    0 - All validations passed
    1 - Validation errors found
"""

import json
import sys
from pathlib import Path

# Paths
WORDBANK_DIR = Path("src/frontend/src/games/wordbank")
WORDBANK_FILE = WORDBANK_DIR / "wordbank.json"
CURRICULUM_FILE = WORDBANK_DIR / "curriculum.json"
BLOCKED_WORDS_FILE = Path("src/frontend/src/games/wordlists/blocked-words.json")

# Allowed tag values
ALLOWED_PATTERNS = {"cvc", "ccvc", "cvcc", "digraph_sh", "digraph_ch", "digraph_th", "digraph_wh", "vowel_team", "r_controlled", "sight", "blend"}
ALLOWED_SEMANTIC = {"animal", "object", "action", "descriptor", "nature", "food", "body", "place"}
ALLOWED_SAFETY = {"ok", "borderline"}
REQUIRED_TAG_KEYS = {"pattern", "difficulty", "is_sight", "semantic", "safety"}


def load_json_file(path: Path) -> dict:
    """Load and parse a JSON file."""
    with open(path, "r") as f:
        return json.load(f)


def load_blocked_words() -> set:
    """Load the set of blocked words."""
    try:
        data = load_json_file(BLOCKED_WORDS_FILE)
        return set(word.upper() for word in data.get("blockedWords", []))
    except Exception as e:
        print(f"Warning: Could not load blocked words: {e}")
        return set()


def validate_wordbank() -> list:
    """Validate the word bank structure and content."""
    errors = []
    
    try:
        data = load_json_file(WORDBANK_FILE)
    except Exception as e:
        return [f"Failed to load word bank: {e}"]
    
    # Check metadata
    metadata = data.get("metadata", {})
    if not metadata.get("version"):
        errors.append("Word bank missing version in metadata")
    
    words = data.get("words", [])
    if not words:
        errors.append("Word bank has no words")
        return errors
    
    print(f"Validating {len(words)} words in word bank...")
    
    blocked_words = load_blocked_words()
    seen_words = set()
    
    for i, entry in enumerate(words):
        word = entry.get("word", "")
        
        # Check word uniqueness
        if word.upper() in seen_words:
            errors.append(f"Duplicate word: '{word}'")
        seen_words.add(word.upper())
        
        # Check blocked words
        if word.upper() in blocked_words:
            errors.append(f"SAFETY VIOLATION: '{word}' is in blocked words list")
        
        # Check word format
        if not word.isalpha():
            errors.append(f"Word '{word}' contains non-alphabetic characters")
        if word != word.upper():
            errors.append(f"Word '{word}' is not uppercase")
        
        # Check length matches
        length = entry.get("length", 0)
        if length != len(word):
            errors.append(f"Word '{word}': length field ({length}) doesn't match actual length ({len(word)})")
        
        # Check tags exist
        tags = entry.get("tags", {})
        if not tags:
            errors.append(f"Word '{word}' has no tags")
            continue
        
        # Check required tag keys
        missing_keys = REQUIRED_TAG_KEYS - set(tags.keys())
        if missing_keys:
            errors.append(f"Word '{word}' missing tags: {missing_keys}")
        
        # Validate pattern tags
        patterns = tags.get("pattern", [])
        for pattern in patterns:
            if pattern not in ALLOWED_PATTERNS:
                errors.append(f"Word '{word}': invalid pattern tag '{pattern}'")
        
        # Validate difficulty
        difficulty = tags.get("difficulty")
        if not isinstance(difficulty, int) or difficulty < 1 or difficulty > 5:
            errors.append(f"Word '{word}': difficulty must be 1-5, got {difficulty}")
        
        # Validate is_sight
        is_sight = tags.get("is_sight")
        if not isinstance(is_sight, bool):
            errors.append(f"Word '{word}': is_sight must be boolean")
        
        # Validate semantic
        semantic = tags.get("semantic", [])
        for sem in semantic:
            if sem not in ALLOWED_SEMANTIC:
                errors.append(f"Word '{word}': invalid semantic tag '{sem}'")
        
        # Validate safety
        safety = tags.get("safety")
        if safety not in ALLOWED_SAFETY:
            errors.append(f"Word '{word}': safety must be 'ok' or 'borderline', got '{safety}'")
    
    return errors


def get_stage_words(all_words: list, criteria: dict) -> set:
    """Get set of words matching stage criteria."""
    matching = set()
    for entry in all_words:
        word = entry.get("word", "")
        length = entry.get("length", 0)
        tags = entry.get("tags", {})
        
        # Check length criteria
        if criteria.get("length") and length not in criteria["length"]:
            continue
        
        # Check pattern criteria
        if criteria.get("pattern"):
            word_patterns = set(tags.get("pattern", []))
            required_patterns = set(criteria["pattern"])
            if not (word_patterns & required_patterns):
                continue
        
        # Check is_sight criteria
        if criteria.get("is_sight") is not None:
            if tags.get("is_sight") != criteria["is_sight"]:
                continue
        
        # Check vowel constraint (for 3-letter CVC words)
        if criteria.get("vowel"):
            if length != 3:
                continue
            middle_letter = word[1] if len(word) >= 2 else ""
            if middle_letter not in criteria["vowel"]:
                continue
        
        matching.add(word)
    
    return matching


def validate_curriculum() -> list:
    """Validate the curriculum structure and that stages have words."""
    errors = []
    
    try:
        data = load_json_file(CURRICULUM_FILE)
    except Exception as e:
        return [f"Failed to load curriculum: {e}"]
    
    stages = data.get("stages", [])
    if not stages:
        errors.append("Curriculum has no stages")
        return errors
    
    print(f"Validating {len(stages)} curriculum stages...")
    
    # Check for duplicate stage IDs
    stage_ids = [s.get("id") for s in stages]
    if len(stage_ids) != len(set(stage_ids)):
        errors.append("Duplicate stage IDs in curriculum")
    
    # Load word bank to check stage coverage
    try:
        wordbank = load_json_file(WORDBANK_FILE)
        all_words = wordbank.get("words", [])
    except Exception:
        all_words = []
    
    stage_word_sets = {}
    
    for stage in stages:
        stage_id = stage.get("id", "unknown")
        
        # Check required fields
        if not stage.get("name"):
            errors.append(f"Stage '{stage_id}' missing name")
        if not stage.get("description"):
            errors.append(f"Stage '{stage_id}' missing description")
        
        criteria = stage.get("criteria", {})
        
        # Check that stage selects at least 10 words
        if all_words:
            matching = get_stage_words(all_words, criteria)
            stage_word_sets[stage_id] = matching
            
            if len(matching) < 10:
                errors.append(f"Stage '{stage_id}' selects only {len(matching)} words (minimum 10)")
            else:
                print(f"  Stage '{stage_id}': {len(matching)} words ✓")
    
    # Stage subset invariants
    print("\nChecking stage invariants...")
    
    # cvc_a and cvc_e should be subsets of cvc_all
    if "cvc_all" in stage_word_sets:
        cvc_all = stage_word_sets["cvc_all"]
        
        for vowel_stage in ["cvc_a", "cvc_e"]:
            if vowel_stage in stage_word_sets:
                vowel_words = stage_word_sets[vowel_stage]
                if not vowel_words.issubset(cvc_all):
                    outsiders = vowel_words - cvc_all
                    errors.append(f"INVARIANT FAILED: {vowel_stage} has words not in cvc_all: {outsiders}")
                else:
                    print(f"  {vowel_stage} ⊂ cvc_all ✓")
    
    # cvc_a and cvc_e should be disjoint (no overlap)
    if "cvc_a" in stage_word_sets and "cvc_e" in stage_word_sets:
        intersection = stage_word_sets["cvc_a"] & stage_word_sets["cvc_e"]
        if intersection:
            errors.append(f"INVARIANT FAILED: cvc_a ∩ cvc_e is not empty: {intersection}")
        else:
            print(f"  cvc_a ∩ cvc_e = ∅ ✓")
    
    return errors


def main():
    """Main entry point."""
    print("=" * 60)
    print("Word Bank Validator")
    print("=" * 60)
    print()
    
    all_errors = []
    
    # Validate word bank
    print("Checking word bank...")
    all_errors.extend(validate_wordbank())
    print()
    
    # Validate curriculum
    print("Checking curriculum...")
    all_errors.extend(validate_curriculum())
    print()
    
    print("=" * 60)
    
    if all_errors:
        print(f"❌ Found {len(all_errors)} validation error(s):")
        print("=" * 60)
        for i, error in enumerate(all_errors, 1):
            print(f"  {i}. {error}")
        print("=" * 60)
        return 1
    else:
        print("✅ All validations passed!")
        print("=" * 60)
        return 0


if __name__ == "__main__":
    sys.exit(main())
