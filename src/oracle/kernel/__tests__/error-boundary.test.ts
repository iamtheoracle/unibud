import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorBoundary } from '../components/error-boundary';

describe('ErrorBoundary', () => {
  let eb: ErrorBoundary;

  beforeEach(() => {
    eb = new ErrorBoundary();
  });

  describe('wrap', () => {
    it('returns the value from a successful function', async () => {
      const result = await eb.wrap(() => 42);
      expect(result).toBe(42);
    });

    it('returns resolved promise value', async () => {
      const result = await eb.wrap(async () => 'async-value');
      expect(result).toBe('async-value');
    });

    it('rethrows errors', async () => {
      await expect(eb.wrap(() => { throw new Error('boom'); })).rejects.toThrow('boom');
    });

    it('calls error handlers on failure', async () => {
      const handler = vi.fn();
      eb.onError(handler);
      await expect(eb.wrap(() => { throw new Error('fail'); })).rejects.toThrow();
      expect(handler).toHaveBeenCalledWith(expect.any(Error), undefined);
    });

    it('passes context to handlers', async () => {
      const handler = vi.fn();
      eb.onError(handler);
      const ctx = { requestId: 'abc' };
      await expect(
        eb.wrap(() => { throw new Error('with-ctx'); }, ctx),
      ).rejects.toThrow();
      expect(handler).toHaveBeenCalledWith(expect.any(Error), ctx);
    });
  });

  describe('handle', () => {
    it('calls all registered handlers', () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      eb.onError(h1);
      eb.onError(h2);
      eb.handle(new Error('test'));
      expect(h1).toHaveBeenCalled();
      expect(h2).toHaveBeenCalled();
    });

    it('wraps non-Error objects in Error', () => {
      const handler = vi.fn();
      eb.onError(handler);
      eb.handle('string error');
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'string error' }),
        undefined,
      );
    });

    it('does not crash if a handler throws', () => {
      eb.onError(() => { throw new Error('handler error'); });
      expect(() => eb.handle(new Error('original'))).not.toThrow();
    });
  });

  describe('onError / unsubscribe', () => {
    it('unsubscribing stops handler calls', () => {
      const handler = vi.fn();
      const unsubscribe = eb.onError(handler);
      unsubscribe();
      eb.handle(new Error('test'));
      expect(handler).not.toHaveBeenCalled();
    });

    it('multiple handlers independent unsubscription', () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      const unsub1 = eb.onError(h1);
      eb.onError(h2);
      unsub1();
      eb.handle(new Error('test'));
      expect(h1).not.toHaveBeenCalled();
      expect(h2).toHaveBeenCalled();
    });
  });

  describe('clearHandlers', () => {
    it('removes all handlers', () => {
      const h1 = vi.fn();
      const h2 = vi.fn();
      eb.onError(h1);
      eb.onError(h2);
      eb.clearHandlers();
      eb.handle(new Error('test'));
      expect(h1).not.toHaveBeenCalled();
      expect(h2).not.toHaveBeenCalled();
    });
  });
});
