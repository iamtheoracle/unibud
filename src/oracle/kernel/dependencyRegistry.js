/**
 * Oracle Kernel — Dependency Registry
 *
 * Tracks inter-service and inter-module dependencies and resolves
 * a safe initialisation order via topological sort (Kahn's algorithm).
 *
 * Features:
 *  - Register any number of service/module IDs with their dependency lists.
 *  - `resolve()` produces an ordered array of IDs that respects all
 *    declared dependencies (topological order).
 *  - `hasCycle()` detects circular dependency chains before they can
 *    cause deadlocks during startup.
 *  - `getDirectDependencies()` / `getDependents()` provide graph navigation.
 *
 * Usage:
 *   import { dependencyRegistry } from '@/oracle/kernel/dependencyRegistry';
 *
 *   dependencyRegistry.register('auth-service',    []);
 *   dependencyRegistry.register('user-service',    ['auth-service']);
 *   dependencyRegistry.register('profile-service', ['user-service']);
 *
 *   const order = dependencyRegistry.resolve();
 *   // → ['auth-service', 'user-service', 'profile-service']
 */

import { logger } from './logger.js';

const log = logger.child('dependencyRegistry');

class DependencyRegistry {
  constructor() {
    /** @type {Map<string, string[]>} id → direct dependency ids */
    this._graph = new Map();
  }

  /**
   * Registers a node and its direct dependencies.
   * Calling register twice with the same id overwrites the
   * dependency list for that id.
   *
   * @param {string}   id
   * @param {string[]} [dependencies=[]]
   * @returns {DependencyRegistry} – fluent interface.
   */
  register(id, dependencies = []) {
    if (typeof id !== 'string' || !id) {
      throw new Error('[OracleKernel:DependencyRegistry] "id" must be a non-empty string.');
    }
    if (!Array.isArray(dependencies)) {
      throw new Error('[OracleKernel:DependencyRegistry] "dependencies" must be an array.');
    }
    this._graph.set(id, [...new Set(dependencies)]);
    log.debug('Dependency entry registered', { id, dependencies });
    return this;
  }

  /**
   * Removes a node from the registry.
   *
   * @param {string} id
   * @returns {boolean}
   */
  unregister(id) {
    const removed = this._graph.delete(id);
    if (removed) log.debug('Dependency entry removed', { id });
    return removed;
  }

  /**
   * Returns the direct dependencies of `id`, or an empty array when
   * `id` is not registered.
   *
   * @param {string} id
   * @returns {string[]}
   */
  getDirectDependencies(id) {
    return [...(this._graph.get(id) ?? [])];
  }

  /**
   * Returns every registered node that directly depends on `id`.
   *
   * @param {string} id
   * @returns {string[]}
   */
  getDependents(id) {
    const result = [];
    for (const [node, deps] of this._graph) {
      if (deps.includes(id)) result.push(node);
    }
    return result;
  }

  /**
   * Detects whether the dependency graph contains any cycles.
   *
   * @returns {boolean}
   */
  hasCycle() {
    try {
      this.resolve();
      return false;
    } catch (err) {
      return err.message.includes('circular');
    }
  }

  /**
   * Returns a topologically-sorted array of all registered IDs such
   * that every node appears after all of its dependencies.
   *
   * @returns {string[]}
   * @throws {Error} when a circular dependency is detected.
   */
  resolve() {
    // Kahn's algorithm
    const inDegree = new Map();
    const adjList  = new Map(); // node → nodes that depend on it

    for (const id of this._graph.keys()) {
      if (!inDegree.has(id)) inDegree.set(id, 0);
      if (!adjList.has(id))  adjList.set(id, []);
    }

    for (const [id, deps] of this._graph) {
      for (const dep of deps) {
        // Ensure dep is in the maps even if not explicitly registered
        if (!inDegree.has(dep)) inDegree.set(dep, 0);
        if (!adjList.has(dep))  adjList.set(dep, []);

        inDegree.set(id, (inDegree.get(id) ?? 0) + 1);
        adjList.get(dep).push(id);
      }
    }

    const queue = [];
    for (const [id, degree] of inDegree) {
      if (degree === 0) queue.push(id);
    }

    const sorted = [];
    while (queue.length > 0) {
      const node = queue.shift();
      sorted.push(node);
      for (const dependent of adjList.get(node) ?? []) {
        const newDegree = inDegree.get(dependent) - 1;
        inDegree.set(dependent, newDegree);
        if (newDegree === 0) queue.push(dependent);
      }
    }

    if (sorted.length < inDegree.size) {
      throw new Error(
        '[OracleKernel:DependencyRegistry] Detected circular dependency. ' +
        'Check your service/module dependency declarations.'
      );
    }

    log.debug('Dependency order resolved', { order: sorted });
    return sorted;
  }

  /** Returns the total number of registered nodes. */
  get size() {
    return this._graph.size;
  }

  /** Removes all registered nodes. Primarily useful in tests. */
  clear() {
    this._graph.clear();
    log.debug('Dependency registry cleared');
  }
}

/** Singleton instance — shared across the entire kernel. */
export const dependencyRegistry = new DependencyRegistry();
