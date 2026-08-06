/**
 * Orbit — Execution Management
 *
 * Orbit handles:
 *   - workflows
 *   - scheduling
 *   - retries
 *   - recovery
 *   - automation
 *   - long-running jobs
 *
 * Scheduler abstraction supporting:
 *   schedule, pause, resume, retry, cancel, recover
 */

import { logger } from '../logger';
import { eventBus } from '../eventBus';
import { telemetryService } from '../services/TelemetryService';
import { configurationService } from '../services/ConfigurationService';
import { workflowRegistry } from '../registries/WorkflowRegistry';

class Orbit {
  constructor() {
    this._jobs = new Map();
    this._timers = new Map();
    this._ready = false;
  }

  init() {
    this._ready = true;
    logger.info('Orbit execution manager initialized', {
      registeredWorkflows: workflowRegistry.list().length,
      maxRetries: configurationService.get('orbit.maxRetries', 3),
    });
  }

  /** Schedule a job to run at a specific time or immediately. */
  schedule({ id, fn, when, retries }) {
    const jobId = id || `job_${Date.now().toString(36)}`;
    const maxRetries = retries ?? configurationService.get('orbit.maxRetries', 3);
    const job = {
      id: jobId,
      fn,
      when: when || null,
      retries: 0,
      maxRetries,
      status: 'scheduled',
      createdAt: Date.now(),
    };
    this._jobs.set(jobId, job);

    const delay = when ? Math.max(0, new Date(when).getTime() - Date.now()) : 0;
    const timer = setTimeout(() => this._execute(jobId), delay);
    this._timers.set(jobId, timer);

    eventBus.publish({
      type: 'workflow.started',
      category: 'workflow',
      payload: { jobId, scheduledFor: when || 'immediate' },
    });

    return jobId;
  }

  /** Execute a job with retry logic. */
  async _execute(jobId) {
    const job = this._jobs.get(jobId);
    if (!job || job.status === 'cancelled') return;

    job.status = 'running';
    const span = telemetryService.startSpan('orbit.execute', { jobId });

    try {
      await job.fn();
      job.status = 'completed';
      job.completedAt = Date.now();

      eventBus.publish({
        type: 'workflow.completed',
        category: 'workflow',
        payload: { jobId, durationMs: span.durationMs },
      });

      telemetryService.endSpan(span, 'ok');
      this._cleanup(jobId);
    } catch (e) {
      job.retries++;
      logger.error('Orbit job failed', { jobId, attempt: job.retries, error: e.message });

      if (job.retries < job.maxRetries) {
        job.status = 'retrying';
        const delay = configurationService.get('orbit.retryDelay', 1000) * job.retries;
        const timer = setTimeout(() => this._execute(jobId), delay);
        this._timers.set(jobId, timer);
        telemetryService.endSpan(span, 'retrying');
      } else {
        job.status = 'failed';
        job.error = e.message;
        eventBus.publish({
          type: 'workflow.failed',
          category: 'workflow',
          payload: { jobId, error: e.message, retries: job.retries },
        });
        telemetryService.endSpan(span, 'failed');
        this._cleanup(jobId);
      }
    }
  }

  /** Pause a scheduled job. */
  pause(jobId) {
    const job = this._jobs.get(jobId);
    if (!job) return false;
    job.status = 'paused';
    const timer = this._timers.get(jobId);
    if (timer) { clearTimeout(timer); this._timers.delete(jobId); }
    logger.debug('Orbit job paused', { jobId });
    return true;
  }

  /** Resume a paused job. */
  resume(jobId) {
    const job = this._jobs.get(jobId);
    if (!job || job.status !== 'paused') return false;
    job.status = 'scheduled';
    setTimeout(() => this._execute(jobId), 0);
    logger.debug('Orbit job resumed', { jobId });
    return true;
  }

  /** Cancel a job. */
  cancel(jobId) {
    const job = this._jobs.get(jobId);
    if (!job) return false;
    job.status = 'cancelled';
    const timer = this._timers.get(jobId);
    if (timer) { clearTimeout(timer); this._timers.delete(jobId); }
    this._jobs.delete(jobId);
    logger.debug('Orbit job cancelled', { jobId });
    return true;
  }

  /** Attempt recovery of failed/stuck jobs. */
  recover() {
    const stuck = Array.from(this._jobs.values()).filter(
      (j) => j.status === 'running' && Date.now() - (j.startedAt || j.createdAt) > 60000
    );
    for (const job of stuck) {
      logger.warn('Orbit recovering stuck job', { jobId: job.id });
      this._execute(job.id);
    }
    return stuck.length;
  }

  _cleanup(jobId) {
    const timer = this._timers.get(jobId);
    if (timer) clearTimeout(timer);
    this._timers.delete(jobId);
    // Keep completed/failed jobs for a short period for status queries
    setTimeout(() => this._jobs.delete(jobId), 30000);
  }

  /** Get job status. */
  getStatus(jobId) {
    const job = this._jobs.get(jobId);
    return job ? { id: job.id, status: job.status, retries: job.retries } : null;
  }

  /** List all active jobs. */
  listJobs() {
    return Array.from(this._jobs.values()).map((j) => ({ id: j.id, status: j.status, retries: j.retries }));
  }

  /** Graceful shutdown — cancel all pending jobs. */
  shutdown() {
    for (const [jobId] of this._jobs) this.cancel(jobId);
    logger.info('Orbit shut down', { cancelledCount: this._timers.size });
  }

  get ready() { return this._ready; }
}

export const orbit = new Orbit();
export default orbit;