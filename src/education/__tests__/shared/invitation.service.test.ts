import { describe, it, expect, beforeEach } from 'vitest';
import { InvitationService } from '../../services/shared/invitation.service';

describe('InvitationService', () => {
  let service: InvitationService;

  beforeEach(() => {
    service = new InvitationService();
  });

  it('sends an invitation', () => {
    const inv = service.sendInvitation('alice@example.com', 'student', 'org1', 'prog1');
    expect(inv.id).toBeTruthy();
    expect(inv.email).toBe('alice@example.com');
    expect(inv.type).toBe('student');
    expect(inv.organizationId).toBe('org1');
    expect(inv.status).toBe('pending');
    expect(inv.token).toBeTruthy();
    expect(inv.expiresAt).toBeInstanceOf(Date);
  });

  it('gets invitation by id', () => {
    const inv = service.sendInvitation('b@example.com', 'educator', 'org2');
    const found = service.getInvitation(inv.id);
    expect(found.id).toBe(inv.id);
  });

  it('throws on get if not found', () => {
    expect(() => service.getInvitation('bad')).toThrow('Invitation not found');
  });

  it('accepts a pending invitation', () => {
    const inv = service.sendInvitation('c@example.com', 'student', 'org3');
    const accepted = service.acceptInvitation(inv.token);
    expect(accepted.status).toBe('accepted');
  });

  it('rejects a pending invitation', () => {
    const inv = service.sendInvitation('d@example.com', 'student', 'org4');
    service.rejectInvitation(inv.token);
    const found = service.getInvitationByToken(inv.token);
    expect(found.status).toBe('rejected');
  });

  it('throws on accept of already accepted invitation', () => {
    const inv = service.sendInvitation('e@example.com', 'admin', 'org5');
    service.acceptInvitation(inv.token);
    expect(() => service.acceptInvitation(inv.token)).toThrow('already accepted');
  });

  it('throws on invalid token', () => {
    expect(() => service.acceptInvitation('bad-token')).toThrow('Invalid invitation token');
  });

  it('lists invitations by organization', () => {
    service.sendInvitation('x@e.com', 'student', 'orgX');
    service.sendInvitation('y@e.com', 'student', 'orgX');
    service.sendInvitation('z@e.com', 'student', 'orgY');
    expect(service.listInvitations('orgX')).toHaveLength(2);
    expect(service.listInvitations('orgY')).toHaveLength(1);
    expect(service.listInvitations()).toHaveLength(3);
  });

  it('lists invitations by status', () => {
    const i1 = service.sendInvitation('a@e.com', 'student', 'org1');
    service.sendInvitation('b@e.com', 'student', 'org1');
    service.acceptInvitation(i1.token);
    expect(service.listInvitations(undefined, 'accepted')).toHaveLength(1);
    expect(service.listInvitations(undefined, 'pending')).toHaveLength(1);
  });
});
