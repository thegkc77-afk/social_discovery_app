import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { MeetupStatus } from '@prisma/client';
import { MeetupStateMachine } from './meetup-state.machine';

describe('MeetupStateMachine', () => {
  const creatorId = 'creator-uuid-1';
  const recipientId = 'recipient-uuid-2';
  const strangerId = 'stranger-uuid-3';

  describe('getTargetStatus', () => {
    it('maps actions to expected enum targets', () => {
      expect(MeetupStateMachine.getTargetStatus('accept')).toBe(MeetupStatus.ACCEPTED);
      expect(MeetupStateMachine.getTargetStatus('decline')).toBe(MeetupStatus.DECLINED);
      expect(MeetupStateMachine.getTargetStatus('cancel')).toBe(MeetupStatus.CANCELLED);
      expect(MeetupStateMachine.getTargetStatus('complete')).toBe(MeetupStatus.COMPLETED);
    });

    it('throws BadRequestException on invalid action', () => {
      expect(() => MeetupStateMachine.getTargetStatus('invalid' as any)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('getAllowedActions', () => {
    it('returns accept, decline, cancel for recipient on PENDING', () => {
      const actions = MeetupStateMachine.getAllowedActions(
        MeetupStatus.PENDING,
        recipientId,
        creatorId,
        recipientId,
      );
      expect(actions).toEqual(['accept', 'decline', 'cancel']);
    });

    it('returns only cancel for creator on PENDING', () => {
      const actions = MeetupStateMachine.getAllowedActions(
        MeetupStatus.PENDING,
        creatorId,
        creatorId,
        recipientId,
      );
      expect(actions).toEqual(['cancel']);
    });

    it('returns cancel, complete for both participants on ACCEPTED', () => {
      const creatorActions = MeetupStateMachine.getAllowedActions(
        MeetupStatus.ACCEPTED,
        creatorId,
        creatorId,
        recipientId,
      );
      expect(creatorActions).toEqual(['cancel', 'complete']);

      const recipientActions = MeetupStateMachine.getAllowedActions(
        MeetupStatus.ACCEPTED,
        recipientId,
        creatorId,
        recipientId,
      );
      expect(recipientActions).toEqual(['cancel', 'complete']);
    });

    it('returns empty array for terminal states or strangers', () => {
      expect(
        MeetupStateMachine.getAllowedActions(
          MeetupStatus.DECLINED,
          recipientId,
          creatorId,
          recipientId,
        ),
      ).toEqual([]);

      expect(
        MeetupStateMachine.getAllowedActions(
          MeetupStatus.CANCELLED,
          creatorId,
          creatorId,
          recipientId,
        ),
      ).toEqual([]);

      expect(
        MeetupStateMachine.getAllowedActions(
          MeetupStatus.PENDING,
          strangerId,
          creatorId,
          recipientId,
        ),
      ).toEqual([]);
    });
  });

  describe('validateTransition', () => {
    it('allows recipient to accept pending invite', () => {
      const target = MeetupStateMachine.validateTransition('accept', {
        userId: recipientId,
        creatorId,
        recipientId,
        currentStatus: MeetupStatus.PENDING,
      });
      expect(target).toBe(MeetupStatus.ACCEPTED);
    });

    it('allows recipient to decline pending invite', () => {
      const target = MeetupStateMachine.validateTransition('decline', {
        userId: recipientId,
        creatorId,
        recipientId,
        currentStatus: MeetupStatus.PENDING,
      });
      expect(target).toBe(MeetupStatus.DECLINED);
    });

    it('forbids creator from accepting or declining their own invite', () => {
      expect(() =>
        MeetupStateMachine.validateTransition('accept', {
          userId: creatorId,
          creatorId,
          recipientId,
          currentStatus: MeetupStatus.PENDING,
        }),
      ).toThrow(ForbiddenException);

      expect(() =>
        MeetupStateMachine.validateTransition('decline', {
          userId: creatorId,
          creatorId,
          recipientId,
          currentStatus: MeetupStatus.PENDING,
        }),
      ).toThrow(ForbiddenException);
    });

    it('allows creator or recipient to cancel a pending invite', () => {
      expect(
        MeetupStateMachine.validateTransition('cancel', {
          userId: creatorId,
          creatorId,
          recipientId,
          currentStatus: MeetupStatus.PENDING,
        }),
      ).toBe(MeetupStatus.CANCELLED);

      expect(
        MeetupStateMachine.validateTransition('cancel', {
          userId: recipientId,
          creatorId,
          recipientId,
          currentStatus: MeetupStatus.PENDING,
        }),
      ).toBe(MeetupStatus.CANCELLED);
    });

    it('allows complete only from ACCEPTED state', () => {
      expect(
        MeetupStateMachine.validateTransition('complete', {
          userId: creatorId,
          creatorId,
          recipientId,
          currentStatus: MeetupStatus.ACCEPTED,
        }),
      ).toBe(MeetupStatus.COMPLETED);

      expect(() =>
        MeetupStateMachine.validateTransition('complete', {
          userId: creatorId,
          creatorId,
          recipientId,
          currentStatus: MeetupStatus.PENDING,
        }),
      ).toThrow(BadRequestException);
    });

    it('rejects strangers completely', () => {
      expect(() =>
        MeetupStateMachine.validateTransition('accept', {
          userId: strangerId,
          creatorId,
          recipientId,
          currentStatus: MeetupStatus.PENDING,
        }),
      ).toThrow(ForbiddenException);
    });
  });
});
