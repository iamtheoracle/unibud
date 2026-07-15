import type { VersionInfo } from './types.ts';

export const ORACLE_KERNEL_VERSION = '1.0.0';

export function parseVersion(version: string): [number, number, number] {
  const cleaned = version.replace(/^v/i, '').replace(/\.x$/, '.0');
  const [major = '0', minor = '0', patch = '0'] = cleaned.split('.');
  return [Number.parseInt(major, 10) || 0, Number.parseInt(minor, 10) || 0, Number.parseInt(patch, 10) || 0];
}

export function compareVersions(left: string, right: string): number {
  const leftParts = parseVersion(left);
  const rightParts = parseVersion(right);

  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index] > rightParts[index]) {
      return 1;
    }

    if (leftParts[index] < rightParts[index]) {
      return -1;
    }
  }

  return 0;
}

export function isCompatibleVersion(required: string | undefined, current = ORACLE_KERNEL_VERSION): boolean {
  if (!required || required === '*') {
    return true;
  }

  if (required.startsWith('^')) {
    const base = required.slice(1);
    return parseVersion(base)[0] === parseVersion(current)[0] && compareVersions(current, base) >= 0;
  }

  if (required.startsWith('>=')) {
    return compareVersions(current, required.slice(2)) >= 0;
  }

  if (required.endsWith('.x')) {
    const requiredParts = required.replace(/^v/i, '').split('.').filter((part) => part !== 'x').map((part) => Number.parseInt(part, 10) || 0);
    const currentParts = parseVersion(current);
    return requiredParts.every((part, index) => currentParts[index] === part);
  }

  return compareVersions(current, required) === 0;
}

export function createVersionInfo(moduleVersions: Record<string, string>, serviceVersions: Record<string, string>): VersionInfo {
  return {
    kernel: ORACLE_KERNEL_VERSION,
    modules: moduleVersions,
    services: serviceVersions,
    compatibility: {
      major: parseVersion(ORACLE_KERNEL_VERSION)[0],
    },
  };
}
