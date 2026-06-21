import type { Category, RoundActionType, RoundEndReason, RoundResult, RoundState } from '../types'

export const ROUND_DURATION_SECONDS = 60

export function shufflePrompts(prompts: string[]) {
  const copy = [...prompts]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }

  return copy
}

export function createRoundState(category: Category): RoundState {
  const shuffled = shufflePrompts(category.prompts)
  const [currentPrompt = null, ...remainingPrompts] = shuffled

  return {
    status: 'active',
    categoryId: category.id,
    categoryName: category.name,
    remainingPrompts,
    currentPrompt,
    seenPrompts: [],
    score: 0,
    skipped: 0,
    remainingTime: ROUND_DURATION_SECONDS,
  }
}

export function applyRoundAction(
  state: RoundState,
  action: RoundActionType,
): RoundState {
  if (state.status !== 'active' || !state.currentPrompt) {
    return state
  }

  const [nextPrompt = null, ...remainingPrompts] = state.remainingPrompts

  return {
    ...state,
    currentPrompt: nextPrompt,
    remainingPrompts,
    seenPrompts: [
      ...state.seenPrompts,
      {
        value: state.currentPrompt,
        action,
      },
    ],
    score: state.score + (action === 'correct' ? 1 : 0),
    skipped: state.skipped + (action === 'skip' ? 1 : 0),
  }
}

export function tickRound(state: RoundState): RoundState {
  if (state.status !== 'active') {
    return state
  }

  return {
    ...state,
    remainingTime: Math.max(0, state.remainingTime - 1),
  }
}

export function finalizeRound(
  state: RoundState,
  endReason: RoundEndReason,
): RoundResult {
  return {
    categoryId: state.categoryId,
    categoryName: state.categoryName,
    score: state.score,
    skipped: state.skipped,
    promptsSeen: state.seenPrompts,
    remainingPrompts: [
      ...(state.currentPrompt ? [state.currentPrompt] : []),
      ...state.remainingPrompts,
    ],
    endReason,
  }
}
