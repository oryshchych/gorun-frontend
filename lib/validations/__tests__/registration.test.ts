import { describe, it, expect } from 'vitest';
import { registrationSchema } from '../registration';

describe('Registration Validation Schema', () => {
  describe('registrationSchema', () => {
    it('should validate correct registration data with valid UUID', () => {
      const validData = {
        eventId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = registrationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      const invalidData = {
        eventId: 'not-a-uuid',
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid event ID format');
      }
    });

    it('should reject empty eventId', () => {
      const invalidData = {
        eventId: '',
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid event ID format');
      }
    });

    it('should reject numeric eventId', () => {
      const invalidData = {
        eventId: '123456',
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid event ID format');
      }
    });

    it('should reject malformed UUID', () => {
      const invalidData = {
        eventId: '550e8400-e29b-41d4-a716',
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid event ID format');
      }
    });
  });
});
