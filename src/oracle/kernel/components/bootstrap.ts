import type { IOracle } from '../types/index';

export interface BootstrapOptions {
  config?: Record<string, unknown>;
  env?: Record<string, string | undefined>;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  kernelVersion?: string;
}

export async function bootstrap(options: BootstrapOptions = {}): Promise<IOracle> {
  const { OracleKernel } = await import('../oracle-kernel');

  const kernel = new OracleKernel({
    logLevel: options.logLevel ?? 'info',
    kernelVersion: options.kernelVersion,
    env: options.env,
  });

  if (options.config) {
    kernel.config.load(options.config);
  }

  await kernel.initialize();
  return kernel;
}
