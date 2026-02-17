// Utility functions for Story AI Studio

import type { Attributes, SkillMap } from '../types';
import { ATTRIBUTE_MAX, ATTRIBUTE_MIN, SKILL_MAX, SKILL_MIN } from '../constants';

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generate a unique ID with optional prefix
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  const id = `${timestamp}-${randomPart}`;
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================================================
// Attribute Utilities
// ============================================================================

/**
 * Clamp an attribute value to valid range
 */
export function clampAttribute(value: number): number {
  return Math.max(ATTRIBUTE_MIN, Math.min(ATTRIBUTE_MAX, value));
}

/**
 * Calculate attribute modifier (D&D-style)
 */
export function getAttributeModifier(value: number): number {
  return Math.floor((value - 10) / 2);
}

/**
 * Validate attributes object
 */
export function validateAttributes(attributes: Partial<Attributes>): boolean {
  const validKeys = ['strength', 'dexterity', 'intelligence', 'wisdom', 'charisma', 'constitution'];
  
  for (const [key, value] of Object.entries(attributes)) {
    if (!validKeys.includes(key)) return false;
    if (typeof value !== 'number') return false;
    if (value < ATTRIBUTE_MIN || value > ATTRIBUTE_MAX) return false;
  }
  
  return true;
}

/**
 * Calculate total attribute points
 */
export function totalAttributePoints(attributes: Attributes): number {
  return Object.values(attributes).reduce((sum, val) => sum + val, 0);
}

// ============================================================================
// Skill Utilities
// ============================================================================

/**
 * Clamp a skill value to valid range
 */
export function clampSkill(value: number): number {
  return Math.max(SKILL_MIN, Math.min(SKILL_MAX, value));
}

/**
 * Calculate skill check success chance
 */
export function skillSuccessChance(skillValue: number, difficulty: number): number {
  const baseChance = 50;
  const skillBonus = (skillValue - difficulty) * 5;
  return Math.max(5, Math.min(95, baseChance + skillBonus));
}

// ============================================================================
// Level & Experience Utilities
// ============================================================================

/**
 * Calculate level from total experience
 */
export function calculateLevel(experience: number, xpPerLevel: number = 1000): number {
  return Math.floor(experience / xpPerLevel) + 1;
}

/**
 * Calculate experience needed for next level
 */
export function experienceToNextLevel(currentLevel: number, xpPerLevel: number = 1000): number {
  return currentLevel * xpPerLevel;
}

/**
 * Calculate experience progress within current level (0-100)
 */
export function levelProgress(experience: number, xpPerLevel: number = 1000): number {
  const currentLevelXp = experience % xpPerLevel;
  return (currentLevelXp / xpPerLevel) * 100;
}

// ============================================================================
// Text Utilities
// ============================================================================

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate a fantasy-style name
 */
export function generateFantasyName(type: 'human' | 'elf' | 'dwarf' | 'orc' | 'any' = 'any'): string {
  const prefixes: Record<string, string[]> = {
    human: ['Alaric', 'Edmund', 'Isolde', 'Rowan', 'Theron', 'Lyra', 'Gareth', 'Elara'],
    elf: ['Aelindra', 'Thalion', 'Eryndor', 'Sylvaris', 'Caladwen', 'Faelorn'],
    dwarf: ['Thorin', 'Bruni', 'Gimli', 'Disa', 'Balin', 'Hilda', 'Gloin', 'Ingra'],
    orc: ['Grom', 'Zug', 'Throk', 'Grishnak', 'Uruk', 'Morg', 'Skar', 'Durg'],
  };
  
  const suffixes: Record<string, string[]> = {
    human: ['son', 'dottir', 'wood', 'stone', 'heart', 'blade', 'shield'],
    elf: ['thas', 'riel', 'on', 'wen', 'orn', 'is'],
    dwarf: ['heim', 'gard', 'stone', 'forge', 'iron', 'beard'],
    orc: ['gore', 'fang', 'tooth', 'skull', 'blood', 'bone'],
  };
  
  const types = type === 'any' ? Object.keys(prefixes) : [type];
  const selectedType = types[Math.floor(Math.random() * types.length)];
  
  const prefixList = prefixes[selectedType] || prefixes.human;
  const suffixList = suffixes[selectedType] || suffixes.human;
  
  const prefix = prefixList[Math.floor(Math.random() * prefixList.length)];
  const suffix = suffixList[Math.floor(Math.random() * suffixList.length)];
  
  return Math.random() > 0.5 ? prefix : `${prefix}${suffix}`;
}

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  
  return formatDate(d);
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate username (alphanumeric, underscores, 3-20 chars)
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Object Utilities
// ============================================================================

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Remove undefined/null values from object
 */
export function removeNullish<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      result[key] = value;
    }
  }
  
  return result as Partial<T>;
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Shuffle array in place
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Pick random element from array
 */
export function randomElement<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Chunk array into smaller arrays
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

// ============================================================================
// Dice Utilities
// ============================================================================

/**
 * Roll a die with specified sides
 */
export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll multiple dice
 */
export function rollDice(count: number, sides: number): number[] {
  return Array.from({ length: count }, () => rollDie(sides));
}

/**
 * Roll dice and sum
 */
export function rollDiceSum(count: number, sides: number): number {
  return rollDice(count, sides).reduce((sum, roll) => sum + roll, 0);
}

/**
 * Parse dice notation (e.g., "2d6+3")
 */
export function parseDiceNotation(notation: string): {
  count: number;
  sides: number;
  modifier: number;
} {
  const match = notation.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
  
  if (!match) {
    throw new Error(`Invalid dice notation: ${notation}`);
  }
  
  return {
    count: parseInt(match[1] || '1', 10),
    sides: parseInt(match[2], 10),
    modifier: parseInt(match[3] || '0', 10),
  };
}

/**
 * Roll from notation string
 */
export function rollFromNotation(notation: string): number {
  const { count, sides, modifier } = parseDiceNotation(notation);
  return rollDiceSum(count, sides) + modifier;
}
