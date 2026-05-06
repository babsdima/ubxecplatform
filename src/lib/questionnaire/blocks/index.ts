/**
 * Реестр всех блоков опросника. Используется при загрузке блока по ID.
 */

import type { BlockId, QuestionnaireBlock } from "../types";
import { BLOCK_A } from "./blockA";
import { BLOCK_B } from "./blockB";
import { BLOCK_C } from "./blockC";
import { BLOCK_D } from "./blockD";

export const BLOCKS: Record<BlockId, QuestionnaireBlock | undefined> = {
  A: BLOCK_A,
  B: BLOCK_B,
  C: BLOCK_C,
  D: BLOCK_D,
  E1: undefined, // E.1 не paginated — отдельная страница с forced-distribution
  E3: undefined, // E.3 — структурированная форма preferences
};

export function getBlock(id: BlockId): QuestionnaireBlock | null {
  return BLOCKS[id] ?? null;
}

export { BLOCK_A, BLOCK_B, BLOCK_C, BLOCK_D };
export {
  BLOCK_E1_META,
  validateE1Distribution,
  E1_GROUP_SIZE,
  E1_REQUIRED_COMPETENCIES,
} from "./blockE1";
export type { E1Distribution, E1Examples, E1Response } from "./blockE1";
