import { Injectable } from '@nestjs/common';

export interface CandidateEntity {
  userId: string;
  name: string;
  intent?: string;
  interests: string[];
  latitude?: number;
  longitude?: number;
  isAvailable?: boolean;
}

export interface CompatibilityBreakdown {
  interestScore: number;
  intentScore: number;
  distanceScore: number;
  topicScore: number;
  availabilityScore: number;
}

export interface CompatibilityResult {
  totalScore: number;
  breakdown: CompatibilityBreakdown;
  isMatchable: boolean;
}

@Injectable()
export class CompatibilityService {
  // Configurable weights totaling 1.0 (100%)
  private readonly interestWeight = 0.40;
  private readonly intentWeight = 0.25;
  private readonly distanceWeight = 0.20;
  private readonly topicWeight = 0.10;
  private readonly availabilityWeight = 0.05;

  private readonly minMatchThreshold = 0.25; // Base minimum required score

  /**
   * Evaluates overall compatibility between two users.
   */
  calculateCompatibility(
    userA: CandidateEntity,
    userB: CandidateEntity,
    topicA: string,
    topicB: string,
    maxDistanceKm: number = 50,
  ): CompatibilityResult {
    // 1. Interest Similarity (Jaccard Index)
    const interestScore = this.calculateJaccardSimilarity(userA.interests, userB.interests);

    // 2. Intent Compatibility
    const intentScore = this.calculateIntentCompatibility(userA.intent, userB.intent);

    // 3. Distance Proximity
    const distanceScore = this.calculateDistanceScore(userA, userB, maxDistanceKm);

    // 4. Topic Match
    const topicScore = this.calculateTopicScore(topicA, topicB, userB.interests);

    // 5. Availability Status
    const availabilityScore = userA.isAvailable !== false && userB.isAvailable !== false ? 1.0 : 0.5;

    // Weighted composite score
    const totalScore =
      interestScore * this.interestWeight +
      intentScore * this.intentWeight +
      distanceScore * this.distanceWeight +
      topicScore * this.topicWeight +
      availabilityScore * this.availabilityWeight;

    return {
      totalScore: parseFloat(totalScore.toFixed(3)),
      breakdown: {
        interestScore: parseFloat(interestScore.toFixed(3)),
        intentScore: parseFloat(intentScore.toFixed(3)),
        distanceScore: parseFloat(distanceScore.toFixed(3)),
        topicScore: parseFloat(topicScore.toFixed(3)),
        availabilityScore: parseFloat(availabilityScore.toFixed(3)),
      },
      isMatchable: totalScore >= this.minMatchThreshold,
    };
  }

  private calculateJaccardSimilarity(interestsA: string[], interestsB: string[]): number {
    if (!interestsA?.length || !interestsB?.length) {
      return 0.2; // default baseline for exploratory matches
    }

    const setA = new Set(interestsA.map((i) => i.toLowerCase()));
    const setB = new Set(interestsB.map((i) => i.toLowerCase()));

    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return union.size > 0 ? intersection.size / union.size : 0.2;
  }

  private calculateIntentCompatibility(intentA?: string, intentB?: string): number {
    if (!intentA || !intentB) return 0.5;

    const a = intentA.toLowerCase();
    const b = intentB.toLowerCase();

    if (a === b) return 1.0;

    // Compatible overlapping categories
    if (
      (a.includes('chat') && b.includes('conversation')) ||
      (a.includes('conversation') && b.includes('chat')) ||
      (a.includes('friend') && b.includes('chat'))
    ) {
      return 0.75;
    }

    return 0.3;
  }

  private calculateDistanceScore(userA: CandidateEntity, userB: CandidateEntity, maxDistKm: number): number {
    if (userA.latitude === undefined || userB.latitude === undefined) {
      return 0.8; // Default nearby assumption
    }

    const dist = this.haversine(
      userA.latitude,
      userA.longitude!,
      userB.latitude!,
      userB.longitude!,
    );

    if (dist > maxDistKm) return 0;
    return Math.max(0, 1 - dist / maxDistKm);
  }

  private calculateTopicScore(topicA: string, topicB: string, candidateBInterests: string[]): number {
    const tA = (topicA || '').toLowerCase();
    const tB = (topicB || '').toLowerCase();

    if (tA && tB && tA === tB) return 1.0;

    const bInterests = (candidateBInterests || []).map((i) => i.toLowerCase());
    if (tA && bInterests.includes(tA)) return 0.8;

    return 0.4;
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
