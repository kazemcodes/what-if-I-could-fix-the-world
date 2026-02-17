// Tests for shared utilities
// Following TDD: Write tests first, then implement

import { describe, it, expect } from 'vitest';
import {
  generateId,
  generateUUID,
  clampAttribute,
  getAttributeModifier,
  validateAttributes,
  totalAttributePoints,
  clampSkill,
  skillSuccessChance,
  calculateLevel,
  experienceToNextLevel,
  levelProgress,
  truncateText,
  titleCase,
  isValidEmail,
  isValidUsername,
  validatePassword,
  deepClone,
  removeNullish,
  shuffleArray,
  randomElement,
  chunkArray,
  rollDie,
  rollDice,
  rollDiceSum,
  parseDiceNotation,
  rollFromNotation,
} from './utils';
import { ATTRIBUTE_MIN, ATTRIBUTE_MAX, SKILL_MIN, SKILL_MAX } from './constants';

describe('ID Generation', () => {
  describe('generateId', () => {
    it('should generate a unique ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should generate ID with prefix', () => {
      const id = generateId('user');
      expect(id.startsWith('user_')).toBe(true);
    });
  });

  describe('generateUUID', () => {
    it('should generate a valid UUID v4', () => {
      const uuid = generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(uuid)).toBe(true);
    });

    it('should generate unique UUIDs', () => {
      const uuids = new Set(Array.from({ length: 100 }, () => generateUUID()));
      expect(uuids.size).toBe(100);
    });
  });
});

describe('Attribute Utilities', () => {
  describe('clampAttribute', () => {
    it('should return value within range', () => {
      expect(clampAttribute(10)).toBe(10);
    });

    it('should clamp to minimum', () => {
      expect(clampAttribute(ATTRIBUTE_MIN - 5)).toBe(ATTRIBUTE_MIN);
    });

    it('should clamp to maximum', () => {
      expect(clampAttribute(ATTRIBUTE_MAX + 5)).toBe(ATTRIBUTE_MAX);
    });
  });

  describe('getAttributeModifier', () => {
    it('should return 0 for value 10', () => {
      expect(getAttributeModifier(10)).toBe(0);
    });

    it('should return positive modifier for high values', () => {
      expect(getAttributeModifier(18)).toBe(4);
      expect(getAttributeModifier(20)).toBe(5);
    });

    it('should return negative modifier for low values', () => {
      expect(getAttributeModifier(8)).toBe(-1);
      expect(getAttributeModifier(6)).toBe(-2);
    });
  });

  describe('validateAttributes', () => {
    it('should validate correct attributes', () => {
      expect(validateAttributes({
        strength: 10,
        dexterity: 12,
        intelligence: 14,
      })).toBe(true);
    });

    it('should reject invalid attribute key', () => {
      expect(validateAttributes({
        strength: 10,
        invalid: 10,
      })).toBe(false);
    });

    it('should reject out of range values', () => {
      expect(validateAttributes({
        strength: 100,
      })).toBe(false);
    });

    it('should reject non-number values', () => {
      expect(validateAttributes({
        strength: 'high' as unknown as number,
      })).toBe(false);
    });
  });

  describe('totalAttributePoints', () => {
    it('should sum all attribute values', () => {
      expect(totalAttributePoints({
        strength: 10,
        dexterity: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        constitution: 10,
      })).toBe(60);
    });
  });
});

describe('Skill Utilities', () => {
  describe('clampSkill', () => {
    it('should return value within range', () => {
      expect(clampSkill(50)).toBe(50);
    });

    it('should clamp to minimum', () => {
      expect(clampSkill(SKILL_MIN - 10)).toBe(SKILL_MIN);
    });

    it('should clamp to maximum', () => {
      expect(clampSkill(SKILL_MAX + 10)).toBe(SKILL_MAX);
    });
  });

  describe('skillSuccessChance', () => {
    it('should return 50% when skill equals difficulty', () => {
      expect(skillSuccessChance(50, 50)).toBe(50);
    });

    it('should increase chance with higher skill', () => {
      const lowSkill = skillSuccessChance(30, 50);
      const highSkill = skillSuccessChance(70, 50);
      expect(highSkill).toBeGreaterThan(lowSkill);
    });

    it('should clamp to 5-95 range', () => {
      expect(skillSuccessChance(0, 100)).toBe(5);
      expect(skillSuccessChance(100, 0)).toBe(95);
    });
  });
});

describe('Level & Experience Utilities', () => {
  describe('calculateLevel', () => {
    it('should return level 1 for 0 experience', () => {
      expect(calculateLevel(0)).toBe(1);
    });

    it('should calculate correct level', () => {
      expect(calculateLevel(1000)).toBe(2);
      expect(calculateLevel(2500)).toBe(3);
      expect(calculateLevel(5000)).toBe(6);
    });
  });

  describe('experienceToNextLevel', () => {
    it('should return correct XP needed', () => {
      expect(experienceToNextLevel(1)).toBe(1000);
      expect(experienceToNextLevel(5)).toBe(5000);
    });
  });

  describe('levelProgress', () => {
    it('should return 0 for no progress', () => {
      expect(levelProgress(0)).toBe(0);
    });

    it('should return 50 for half progress', () => {
      expect(levelProgress(500)).toBe(50);
    });

    it('should return 0 at level boundary', () => {
      expect(levelProgress(1000)).toBe(0);
    });
  });
});

describe('Text Utilities', () => {
  describe('truncateText', () => {
    it('should not truncate short text', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('should truncate long text with ellipsis', () => {
      expect(truncateText('Hello World', 8)).toBe('Hello...');
    });
  });

  describe('titleCase', () => {
    it('should capitalize each word', () => {
      expect(titleCase('hello world')).toBe('Hello World');
    });

    it('should handle mixed case', () => {
      expect(titleCase('HELLO WORLD')).toBe('Hello World');
    });
  });
});

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.org')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('no@domain')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
    });
  });

  describe('isValidUsername', () => {
    it('should validate correct usernames', () => {
      expect(isValidUsername('user123')).toBe(true);
      expect(isValidUsername('test_user')).toBe(true);
      expect(isValidUsername('abc')).toBe(true);
    });

    it('should reject invalid usernames', () => {
      expect(isValidUsername('ab')).toBe(false); // Too short
      expect(isValidUsername('a'.repeat(21))).toBe(false); // Too long
      expect(isValidUsername('user-name')).toBe(false); // Invalid char
      expect(isValidUsername('user name')).toBe(false); // Space
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('Password123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should require uppercase', () => {
      const result = validatePassword('password123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should require lowercase', () => {
      const result = validatePassword('PASSWORD123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should require number', () => {
      const result = validatePassword('Password');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });
  });
});

describe('Object Utilities', () => {
  describe('deepClone', () => {
    it('should create a deep copy', () => {
      const original = { a: { b: { c: 1 } } };
      const clone = deepClone(original);
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.a).not.toBe(original.a);
    });
  });

  describe('removeNullish', () => {
    it('should remove null and undefined values', () => {
      const result = removeNullish({
        a: 1,
        b: null,
        c: undefined,
        d: 'test',
      });
      expect(result).toEqual({ a: 1, d: 'test' });
    });

    it('should keep falsy values that are not nullish', () => {
      const result = removeNullish({
        a: 0,
        b: '',
        c: false,
      });
      expect(result).toEqual({ a: 0, b: '', c: false });
    });
  });
});

describe('Array Utilities', () => {
  describe('shuffleArray', () => {
    it('should return array with same elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      expect(shuffled.sort()).toEqual(arr.sort());
    });

    it('should not modify original array', () => {
      const arr = [1, 2, 3];
      shuffleArray(arr);
      expect(arr).toEqual([1, 2, 3]);
    });
  });

  describe('randomElement', () => {
    it('should return element from array', () => {
      const arr = [1, 2, 3];
      const element = randomElement(arr);
      expect(arr).toContain(element);
    });

    it('should return undefined for empty array', () => {
      expect(randomElement([])).toBeUndefined();
    });
  });

  describe('chunkArray', () => {
    it('should split array into chunks', () => {
      expect(chunkArray([1, 2, 3, 4, 5, 6], 2)).toEqual([[1, 2], [3, 4], [5, 6]]);
    });

    it('should handle uneven chunks', () => {
      expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });
  });
});

describe('Dice Utilities', () => {
  describe('rollDie', () => {
    it('should return value between 1 and sides', () => {
      for (let i = 0; i < 100; i++) {
        const result = rollDie(20);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(20);
      }
    });
  });

  describe('rollDice', () => {
    it('should return array of correct length', () => {
      const rolls = rollDice(3, 6);
      expect(rolls).toHaveLength(3);
    });

    it('should have valid values', () => {
      const rolls = rollDice(10, 20);
      rolls.forEach(roll => {
        expect(roll).toBeGreaterThanOrEqual(1);
        expect(roll).toBeLessThanOrEqual(20);
      });
    });
  });

  describe('rollDiceSum', () => {
    it('should return sum of rolls', () => {
      // Mock to test logic
      const sum = rollDiceSum(2, 6);
      expect(sum).toBeGreaterThanOrEqual(2);
      expect(sum).toBeLessThanOrEqual(12);
    });
  });

  describe('parseDiceNotation', () => {
    it('should parse basic notation', () => {
      expect(parseDiceNotation('d6')).toEqual({ count: 1, sides: 6, modifier: 0 });
      expect(parseDiceNotation('2d6')).toEqual({ count: 2, sides: 6, modifier: 0 });
    });

    it('should parse notation with modifier', () => {
      expect(parseDiceNotation('2d6+3')).toEqual({ count: 2, sides: 6, modifier: 3 });
      expect(parseDiceNotation('1d20-2')).toEqual({ count: 1, sides: 20, modifier: -2 });
    });

    it('should throw for invalid notation', () => {
      expect(() => parseDiceNotation('invalid')).toThrow();
    });
  });

  describe('rollFromNotation', () => {
    it('should roll correctly from notation', () => {
      const result = rollFromNotation('2d6+3');
      expect(result).toBeGreaterThanOrEqual(5); // 2*1 + 3
      expect(result).toBeLessThanOrEqual(15); // 2*6 + 3
    });
  });
});
