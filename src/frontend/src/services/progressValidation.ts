/**
 * Progress Validation Utilities
 * 
 * Runtime validation for ProgressItem to ensure data integrity.
 * Uses manual validation (no external deps) for minimal bundle impact.
 */

import type { ProgressItem } from './progressQueue';
import {
  SCORE_BOUNDS,
  DURATION_BOUNDS,
  VALID_STATUSES,
} from './progressConstants';

export interface ValidationError {
  field: string;
  message: string;
  value: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * UUID v4 regex pattern
 * Matches: 550e8400-e29b-41d4-a716-446655440000
 */
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * ISO 8601 datetime regex (simplified)
 * Matches: 2024-01-15T10:30:00.000Z
 */
const ISO_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

/**
 * Validate a ProgressItem
 * Returns validation result with any errors found
 */
export function validateProgressItem(item: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // Type check
  if (typeof item !== 'object' || item === null) {
    return { valid: false, errors: [{ field: 'root', message: 'Item must be an object', value: item }] };
  }

  const progressItem = item as Record<string, unknown>;

  // Required field: idempotency_key (UUID)
  if (!progressItem.idempotency_key) {
    errors.push({ field: 'idempotency_key', message: 'idempotency_key is required', value: progressItem.idempotency_key });
  } else if (typeof progressItem.idempotency_key !== 'string') {
    errors.push({ field: 'idempotency_key', message: 'idempotency_key must be a string', value: progressItem.idempotency_key });
  } else if (!UUID_V4_REGEX.test(progressItem.idempotency_key)) {
    errors.push({ field: 'idempotency_key', message: 'idempotency_key must be a valid UUID v4', value: progressItem.idempotency_key });
  }

  // Required field: profile_id (UUID)
  if (!progressItem.profile_id) {
    errors.push({ field: 'profile_id', message: 'profile_id is required', value: progressItem.profile_id });
  } else if (typeof progressItem.profile_id !== 'string') {
    errors.push({ field: 'profile_id', message: 'profile_id must be a string', value: progressItem.profile_id });
  } else if (!UUID_V4_REGEX.test(progressItem.profile_id)) {
    errors.push({ field: 'profile_id', message: 'profile_id must be a valid UUID v4', value: progressItem.profile_id });
  }

  // Required field: activity_type
  if (!progressItem.activity_type) {
    errors.push({ field: 'activity_type', message: 'activity_type is required', value: progressItem.activity_type });
  } else if (typeof progressItem.activity_type !== 'string') {
    errors.push({ field: 'activity_type', message: 'activity_type must be a string', value: progressItem.activity_type });
  } else if (progressItem.activity_type.length < 1 || progressItem.activity_type.length > 100) {
    errors.push({ field: 'activity_type', message: 'activity_type must be 1-100 characters', value: progressItem.activity_type });
  }

  // Required field: content_id
  if (!progressItem.content_id) {
    errors.push({ field: 'content_id', message: 'content_id is required', value: progressItem.content_id });
  } else if (typeof progressItem.content_id !== 'string') {
    errors.push({ field: 'content_id', message: 'content_id must be a string', value: progressItem.content_id });
  } else if (progressItem.content_id.length < 1 || progressItem.content_id.length > 255) {
    errors.push({ field: 'content_id', message: 'content_id must be 1-255 characters', value: progressItem.content_id });
  }

  // Required field: score (number within bounds)
  if (typeof progressItem.score !== 'number') {
    errors.push({ field: 'score', message: 'score must be a number', value: progressItem.score });
  } else if (!Number.isFinite(progressItem.score)) {
    errors.push({ field: 'score', message: 'score must be finite', value: progressItem.score });
  } else if (progressItem.score < SCORE_BOUNDS.min || progressItem.score > SCORE_BOUNDS.max) {
    errors.push({ field: 'score', message: `score must be between ${SCORE_BOUNDS.min} and ${SCORE_BOUNDS.max}`, value: progressItem.score });
  }

  // Optional field: duration_seconds
  if (progressItem.duration_seconds !== undefined) {
    if (typeof progressItem.duration_seconds !== 'number') {
      errors.push({ field: 'duration_seconds', message: 'duration_seconds must be a number', value: progressItem.duration_seconds });
    } else if (!Number.isInteger(progressItem.duration_seconds)) {
      errors.push({ field: 'duration_seconds', message: 'duration_seconds must be an integer', value: progressItem.duration_seconds });
    } else if (progressItem.duration_seconds < DURATION_BOUNDS.min || progressItem.duration_seconds > DURATION_BOUNDS.max) {
      errors.push({ field: 'duration_seconds', message: `duration_seconds must be between ${DURATION_BOUNDS.min} and ${DURATION_BOUNDS.max}`, value: progressItem.duration_seconds });
    }
  }

  // Optional field: completed (boolean)
  if (progressItem.completed !== undefined && typeof progressItem.completed !== 'boolean') {
    errors.push({ field: 'completed', message: 'completed must be a boolean', value: progressItem.completed });
  }

  // Optional field: status
  if (progressItem.status !== undefined) {
    if (!VALID_STATUSES.includes(progressItem.status as typeof VALID_STATUSES[number])) {
      errors.push({ field: 'status', message: `status must be one of: ${VALID_STATUSES.join(', ')}`, value: progressItem.status });
    }
  }

  // Optional field: timestamp (ISO 8601)
  if (progressItem.timestamp !== undefined) {
    if (typeof progressItem.timestamp !== 'string') {
      errors.push({ field: 'timestamp', message: 'timestamp must be a string', value: progressItem.timestamp });
    } else if (!ISO_DATETIME_REGEX.test(progressItem.timestamp)) {
      errors.push({ field: 'timestamp', message: 'timestamp must be ISO 8601 format', value: progressItem.timestamp });
    }
  }

  // Optional field: meta_data (object)
  if (progressItem.meta_data !== undefined) {
    if (typeof progressItem.meta_data !== 'object' || progressItem.meta_data === null) {
      errors.push({ field: 'meta_data', message: 'meta_data must be an object', value: progressItem.meta_data });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate and throw on error
 * Use when you want immediate failure for invalid items
 */
export function assertValidProgressItem(item: unknown): asserts item is ProgressItem {
  const result = validateProgressItem(item);
  if (!result.valid) {
    const errorMessages = result.errors.map(e => `${e.field}: ${e.message}`).join(', ');
    throw new Error(`Invalid ProgressItem: ${errorMessages}`);
  }
}

/**
 * Check if value looks like a valid ProgressItem (type guard)
 */
export function isValidProgressItem(item: unknown): item is ProgressItem {
  return validateProgressItem(item).valid;
}
