import { describe, it, expect, beforeEach } from 'vitest';
import { InvitationService } from '../services/invitation.service.js';
import { OracleLogger } from '../../oracle/kernel/logger.js';

const logger = new OracleLogger('Test');

describe('InvitationService', () => {
  let service: InvitationService;

  beforeEach(() => {
    service = new InvitationService(logger);
  });

  it('sends an invitation', () => {
    const inv = service.sendInvitation('alice@example.com', 'student', 'org-1', 'prog-1');
    expect(inv.id).toBeTruthy();
    expect(inv.email).toBe('alice@example.com');
    expect(inv.type).toBe('student');
    expect(inv.status).toBe('pending');
    expect(inv.token).toBeTruthy();
    expect(inv.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('gets an invitation by token', () => {
    const inv = service.sendInvitation('bob@example.com', 'educator', 'org-2');
    expect(service.getInvitation(inv.token)).toEqual(inv);
  });

  it('throws when getting unknown token', () => {
    expect(() => service.getInvitation('nonexistent-token')).toThrow('Invitation not found');
  });

  it('accepts an invitation', () => {
    const inv = service.sendInvitation('carol@example.com', 'student');
    const accepted = service.acceptInvitation(inv.token);
    expect(accepted.status).toBe('accepted');
    expect(accepted.acceptedAt).toBeTruthy();
  });

  it('throws when accepting non-pending invitation', () => {
    const inv = service.sendInvitation('dave@example.com', 'student');
    service.acceptInvitation(inv.token);
    expect(() => service.acceptInvitation(inv.token)).toThrow('not pending');
  });

  it('rejects an invitation', () => {
    const inv = service.sendInvitation('eve@example.com', 'educator');
    service.rejectInvitation(inv.token);
    expect(service.getInvitation(inv.token).status).toBe('rejected');
  });

  it('throws when rejecting non-pending invitation', () => {
    const inv = service.sendInvitation('frank@example.com', 'student');
    service.rejectInvitation(inv.token);
    expect(() => service.rejectInvitation(inv.token)).toThrow('not pending');
  });

  it('lists invitations filtered by org', () => {
    service.sendInvitation('a@test.com', 'student', 'org-1');
    service.sendInvitation('b@test.com', 'student', 'org-1');
    service.sendInvitation('c@test.com', 'educator', 'org-2');
    expect(service.listInvitations('org-1')).toHaveLength(2);
    expect(service.listInvitations('org-2')).toHaveLength(1);
    expect(service.listInvitations()).toHaveLength(3);
  });

  it('revokes an invitation', () => {
    const inv = service.sendInvitation('grace@example.com', 'student');
    service.revokeInvitation(inv.id);
    expect(service.getInvitation(inv.token).status).toBe('revoked');
  });

  it('throws when revoking unknown invitation', () => {
    expect(() => service.revokeInvitation('unknown-id')).toThrow('Invitation not found');
  });
});
