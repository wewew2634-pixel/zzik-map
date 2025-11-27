/**
 * ZZIK MAP - Logger Unit Tests
 * V6: Testing structured logging system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/lib/logger';

describe('Logger', () => {
  let consoleSpy: {
    debug: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logger.info', () => {
    it('should call console.info', () => {
      logger.info('Test info message', { key: 'value' });
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('should handle empty context', () => {
      expect(() => logger.info('Test message')).not.toThrow();
    });

    it('should handle various context types', () => {
      expect(() => logger.info('Test', { str: 'value', num: 123, bool: true })).not.toThrow();
    });
  });

  describe('logger.warn', () => {
    it('should call console.warn', () => {
      logger.warn('Warning message', { context: 'test' });
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('should include message in output', () => {
      logger.warn('Warning test', {});
      expect(consoleSpy.warn).toHaveBeenCalled();
      const callArg = consoleSpy.warn.mock.calls[0][0];
      expect(callArg).toContain('Warning test');
    });
  });

  describe('logger.error', () => {
    it('should call console.error', () => {
      logger.error('Error message', {});
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should include error details when Error object provided', () => {
      const error = new Error('Test error');
      logger.error('Something failed', { operation: 'test' }, error);
      expect(consoleSpy.error).toHaveBeenCalled();
      const callArg = consoleSpy.error.mock.calls[0][0];
      expect(callArg).toContain('Test error');
    });

    it('should handle error without Error object', () => {
      expect(() => logger.error('Error without exception', {})).not.toThrow();
    });

    it('should include context in output', () => {
      logger.error('Error', { userId: '123' });
      const callArg = consoleSpy.error.mock.calls[0][0];
      expect(callArg).toContain('123');
    });
  });

  describe('logger.debug', () => {
    it('should not throw when called', () => {
      expect(() => logger.debug('Debug message', { debug: true })).not.toThrow();
    });
  });

  describe('logger.api', () => {
    it('should create API-scoped logger', () => {
      const apiLogger = logger.api('/api/test', 'GET');
      expect(apiLogger).toHaveProperty('info');
      expect(apiLogger).toHaveProperty('warn');
      expect(apiLogger).toHaveProperty('error');
      expect(apiLogger).toHaveProperty('debug');
    });

    it('should include route and method in context', () => {
      const apiLogger = logger.api('/api/test', 'POST');
      apiLogger.info('Test message');
      const callArg = consoleSpy.info.mock.calls[0][0];
      expect(callArg).toContain('/api/test');
      expect(callArg).toContain('POST');
    });
  });

  describe('logger.time', () => {
    it('should create a timer', () => {
      const timer = logger.time('operation');
      expect(timer).toHaveProperty('end');
    });

    it('should return duration on end', async () => {
      const timer = logger.time('test-op');
      await new Promise((r) => setTimeout(r, 10));
      const duration = timer.end();
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should log with duration on end', async () => {
      const timer = logger.time('test-op');
      timer.end({ extra: 'context' });
      expect(consoleSpy.info).toHaveBeenCalled();
      const callArg = consoleSpy.info.mock.calls[0][0];
      expect(callArg).toContain('completed');
    });
  });

  describe('Edge cases', () => {
    it('should handle null context values', () => {
      expect(() => logger.info('Test', { nullValue: null as unknown as string })).not.toThrow();
    });

    it('should handle undefined context values', () => {
      expect(() => logger.info('Test', { undefinedValue: undefined as unknown as string })).not.toThrow();
    });

    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(10000);
      expect(() => logger.info(longMessage, {})).not.toThrow();
    });

    it('should handle special characters in messages', () => {
      expect(() => logger.info('Test with émojis 🎉 and <html>', {})).not.toThrow();
    });

    it('should handle nested context objects', () => {
      expect(() =>
        logger.info('Test', {
          nested: JSON.stringify({ deep: { value: 'test' } }),
        })
      ).not.toThrow();
    });
  });
});
