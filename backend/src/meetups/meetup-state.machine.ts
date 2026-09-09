import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { MeetupStatus } from '@prisma/client';

export type MeetupAction = 'accept' | 'decline' | 'cancel' | 'complete';

export interface TransitionContext {
  userId: string;
  creatorId: string;
  recipientId: string;
  currentStatus: MeetupStatus;
}

export class MeetupStateMachine {
  /**
   * Valid target transitions for each state
   */
  private static readonly VALID_TRANSITIONS: Record<MeetupStatus, MeetupStatus[]> = {
    [MeetupStatus.PENDING]: [
      MeetupStatus.ACCEPTED,
      MeetupStatus.DECLINED,
      MeetupStatus.CANCELLED,
    ],
    [MeetupStatus.ACCEPTED]: [
      MeetupStatus.CANCELLED,
      MeetupStatus.COMPLETED,
    ],
    [MeetupStatus.DECLINED]: [],
    [MeetupStatus.CANCELLED]: [],
    [MeetupStatus.COMPLETED]: [],
  };

  /**
   * Map action verb to target status
   */
  static getTargetStatus(action: MeetupAction): MeetupStatus {
    switch (action) {
      case 'accept':
        return MeetupStatus.ACCEPTED;
      case 'decline':
        return MeetupStatus.DECLINED;
      case 'cancel':
        return MeetupStatus.CANCELLED;
      case 'complete':
        return MeetupStatus.COMPLETED;
      default:
        throw new BadRequestException(`Unknown action: ${action}`);
    }
  }

  /**
   * Get valid next actions for a given status and user role
   */
  static getAllowedActions(
    status: MeetupStatus,
    userId: string,
    creatorId: string,
    recipientId: string,
  ): MeetupAction[] {
    const isCreator = userId === creatorId;
    const isRecipient = userId === recipientId;

    if (!isCreator && !isRecipient) {
      return [];
    }

    const actions: MeetupAction[] = [];

    if (status === MeetupStatus.PENDING) {
      if (isRecipient) {
        actions.push('accept', 'decline', 'cancel');
      } else if (isCreator) {
        actions.push('cancel');
      }
    } else if (status === MeetupStatus.ACCEPTED) {
      actions.push('cancel', 'complete');
    }

    return actions;
  }

  /**
   * Validate and enforce state transition permissions
   */
  static validateTransition(action: MeetupAction, context: TransitionContext): MeetupStatus {
    const { userId, creatorId, recipientId, currentStatus } = context;
    const targetStatus = this.getTargetStatus(action);

    const isCreator = userId === creatorId;
    const isRecipient = userId === recipientId;

    if (!isCreator && !isRecipient) {
      throw new ForbiddenException('You are not a participant in this meetup');
    }

    // Check if target state is a valid transition from current state
    const allowedTargets = this.VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedTargets.includes(targetStatus)) {
      throw new BadRequestException(
        `Cannot transition meetup from "${currentStatus}" to "${targetStatus}". Allowed target states: ${
          allowedTargets.length > 0 ? allowedTargets.join(', ') : 'None (Terminal state)'
        }`,
      );
    }

    // Role-based validation
    if (action === 'accept' || action === 'decline') {
      if (!isRecipient) {
        throw new ForbiddenException(
          `Only the invited recipient can ${action} this meetup invitation`,
        );
      }
    }

    return targetStatus;
  }
}
