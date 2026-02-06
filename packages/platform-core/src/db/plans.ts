/**
 * Plan Database Operations
 */

import { Plan } from '../types/platform';

export async function getPlan(db: D1Database, planId: string): Promise<Plan | null> {
  const result = await db
    .prepare('SELECT * FROM plans WHERE id = ?')
    .bind(planId)
    .first<Plan>();

  return result || null;
}

export async function getAllPlans(db: D1Database): Promise<Plan[]> {
  const result = await db
    .prepare('SELECT * FROM plans WHERE is_active = 1')
    .all<Plan>();

  return result.results || [];
}
