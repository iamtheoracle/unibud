/**
 * Generic kernel error type.
 */
export class OracleKernelError extends Error {
  /**
   * @param {string} message
   * @param {{ cause?: unknown; code?: string }} [options]
   */
  constructor(message, options = {}) {
    super(message);
    this.name = "OracleKernelError";
    this.code = options.code ?? "KERNEL_ERROR";
    this.cause = options.cause;
  }
}

export class ErrorBoundary {
  /**
   * @param {(error: OracleKernelError) => void} [onError]
   */
  constructor(onError = () => {}) {
    this.onError = onError;
  }

  /**
   * @template T
   * @param {() => T} action
   * @param {{ code?: string; message?: string }} [options]
   * @returns {T}
   */
  execute(action, options = {}) {
    try {
      return action();
    } catch (error) {
      const wrapped = error instanceof OracleKernelError
        ? error
        : new OracleKernelError(options.message ?? "Kernel operation failed", {
            cause: error,
            code: options.code,
          });

      this.onError(wrapped);
      throw wrapped;
    }
  }

  /**
   * @template T
   * @param {() => Promise<T>} action
   * @param {{ code?: string; message?: string }} [options]
   * @returns {Promise<T>}
   */
  async executeAsync(action, options = {}) {
    try {
      return await action();
    } catch (error) {
      const wrapped = error instanceof OracleKernelError
        ? error
        : new OracleKernelError(options.message ?? "Kernel operation failed", {
            cause: error,
            code: options.code,
          });

      this.onError(wrapped);
      throw wrapped;
    }
  }
}
