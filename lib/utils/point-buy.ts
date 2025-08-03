/**
 * D&D 5e Point-Buy System Utilities
 * 
 * Provides centralized, consistent point-buy validation and calculation
 * following official D&D 5e rules:
 * - All abilities start at 8 (cost: 0 points)
 * - Scores 9-13 cost 1 point each
 * - Score 14 costs 2 points (7 points total from 8)
 * - Score 15 costs 2 points (9 points total from 8)
 * - Total budget: exactly 27 points
 * - Maximum score: 15 (before racial bonuses)
 * - Minimum score: 8
 */

import type { AbilityScores } from '@/types/character'

export const POINT_BUY_RULES = {
  MIN_SCORE: 8,
  MAX_SCORE: 15,
  TOTAL_POINTS: 27,
  BASE_COST: 0, // Cost for score of 8
  STANDARD_COST: 1, // Cost per point for scores 9-13
  PREMIUM_COST: 2, // Additional cost for scores 14-15
} as const

/**
 * Calculate the point-buy cost for a single ability score
 */
export function calculateScoreCost(score: number): number {
  if (score < POINT_BUY_RULES.MIN_SCORE) return 0
  if (score <= 13) return score - POINT_BUY_RULES.MIN_SCORE
  if (score === 14) return 7 // 6 points (8->13) + 1 premium
  if (score === 15) return 9 // 6 points (8->13) + 2 premium
  return Math.max(0, score - POINT_BUY_RULES.MIN_SCORE) // Fallback
}

/**
 * Calculate total points used for a set of ability scores
 */
export function calculateTotalPointsUsed(scores: AbilityScores | Record<string, number>): number {
  return Object.values(scores).reduce(
    (total, score) => total + calculateScoreCost(score),
    0
  )
}

/**
 * Validate ability scores against D&D 5e point-buy rules
 */
export function validatePointBuyStats(stats: AbilityScores | Record<string, number>): {
  valid: boolean
  pointsUsed: number
  pointsRemaining: number
  maxScore: number
  minScore: number
  error?: string
} {
  const scores = Object.values(stats)
  const pointsUsed = calculateTotalPointsUsed(stats)
  const maxScore = Math.max(...scores)
  const minScore = Math.min(...scores)

  // Check score ranges
  if (minScore < POINT_BUY_RULES.MIN_SCORE) {
    return {
      valid: false,
      pointsUsed,
      pointsRemaining: POINT_BUY_RULES.TOTAL_POINTS - pointsUsed,
      maxScore,
      minScore,
      error: `All ability scores must be at least ${POINT_BUY_RULES.MIN_SCORE}`,
    }
  }

  if (maxScore > POINT_BUY_RULES.MAX_SCORE) {
    return {
      valid: false,
      pointsUsed,
      pointsRemaining: POINT_BUY_RULES.TOTAL_POINTS - pointsUsed,
      maxScore,
      minScore,
      error: `All ability scores must be at most ${POINT_BUY_RULES.MAX_SCORE}`,
    }
  }

  // Check point budget
  if (pointsUsed > POINT_BUY_RULES.TOTAL_POINTS) {
    return {
      valid: false,
      pointsUsed,
      pointsRemaining: POINT_BUY_RULES.TOTAL_POINTS - pointsUsed,
      maxScore,
      minScore,
      error: `Point-buy total exceeds ${POINT_BUY_RULES.TOTAL_POINTS} points (used ${pointsUsed})`,
    }
  }

  return {
    valid: true,
    pointsUsed,
    pointsRemaining: POINT_BUY_RULES.TOTAL_POINTS - pointsUsed,
    maxScore,
    minScore,
  }
}

/**
 * Check if a set of ability scores is a valid point-buy distribution
 */
export function isValidPointBuyDistribution(stats: AbilityScores | Record<string, number>): boolean {
  const validation = validatePointBuyStats(stats)
  return validation.valid && validation.pointsUsed === POINT_BUY_RULES.TOTAL_POINTS
}

/**
 * Get the remaining points available for spending
 */
export function getRemainingPoints(stats: AbilityScores | Record<string, number>): number {
  const pointsUsed = calculateTotalPointsUsed(stats)
  return Math.max(0, POINT_BUY_RULES.TOTAL_POINTS - pointsUsed)
}

/**
 * Check if a specific score can be increased without exceeding limits
 */
export function canIncreaseScore(
  currentScore: number,
  allStats: AbilityScores | Record<string, number>
): boolean {
  if (currentScore >= POINT_BUY_RULES.MAX_SCORE) return false
  
  const currentCost = calculateScoreCost(currentScore)
  const newCost = calculateScoreCost(currentScore + 1)
  const additionalCost = newCost - currentCost
  const remainingPoints = getRemainingPoints(allStats)
  
  return remainingPoints >= additionalCost
}

/**
 * Get the cost to increase a score by one point
 */
export function getIncreaseCost(currentScore: number): number {
  if (currentScore >= POINT_BUY_RULES.MAX_SCORE) return 0
  const currentCost = calculateScoreCost(currentScore)
  const newCost = calculateScoreCost(currentScore + 1)
  return newCost - currentCost
}