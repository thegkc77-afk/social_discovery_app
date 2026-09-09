import { Injectable, Logger } from '@nestjs/common';
import { CandidateEntity } from './compatibility.service';

export interface QueueEntry {
  requestId: string;
  userId: string;
  topic: string;
  maxDistanceKm: number;
  candidate: CandidateEntity;
  joinedAt: Date;
  socketId?: string;
  timeoutHandle?: NodeJS.Timeout;
}

@Injectable()
export class MatchingQueueService {
  private readonly logger = new Logger(MatchingQueueService.name);
  private queue: Map<string, QueueEntry> = new Map(); // userId -> QueueEntry

  addToQueue(entry: QueueEntry) {
    // Remove existing entry for user if any
    this.removeFromQueue(entry.userId);

    // Set 60-second automatic search expiration
    const timeoutHandle = setTimeout(() => {
      this.logger.log(`⏰ Queue request expired for user '${entry.userId}'`);
      this.queue.delete(entry.userId);
    }, 60000);

    entry.timeoutHandle = timeoutHandle;
    this.queue.set(entry.userId, entry);
    this.logger.log(`📥 User '${entry.userId}' added to Talk Now queue (Topic: ${entry.topic}). Queue size: ${this.queue.size}`);
  }

  removeFromQueue(userId: string): QueueEntry | undefined {
    const entry = this.queue.get(userId);
    if (entry) {
      if (entry.timeoutHandle) {
        clearTimeout(entry.timeoutHandle);
      }
      this.queue.delete(userId);
      this.logger.log(`📤 User '${userId}' removed from Talk Now queue. Queue size: ${this.queue.size}`);
    }
    return entry;
  }

  getEntry(userId: string): QueueEntry | undefined {
    return this.queue.get(userId);
  }

  getWaitingCandidates(excludeUserId: string): QueueEntry[] {
    const list: QueueEntry[] = [];
    for (const [uid, entry] of this.queue.entries()) {
      if (uid !== excludeUserId) {
        list.push(entry);
      }
    }
    return list;
  }

  getQueueSize(): number {
    return this.queue.size;
  }
}
