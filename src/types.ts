export type CategorySource = 'built_in' | 'custom'

export type Category = {
  id: string
  name: string
  source: CategorySource
  prompts: string[]
}

export type RoundStatus = 'idle' | 'active' | 'finished'

export type RoundEndReason = 'timer' | 'manual'

export type RoundActionType = 'correct' | 'skip'

export type TapControlAvailability = 'mobile' | 'desktop'

export type SeenPrompt = {
  value: string
  action: RoundActionType
}

export type RoundState = {
  status: RoundStatus
  categoryId: string
  categoryName: string
  remainingPrompts: string[]
  currentPrompt: string | null
  seenPrompts: SeenPrompt[]
  score: number
  skipped: number
  remainingTime: number
}

export type RoundResult = {
  categoryId: string
  categoryName: string
  score: number
  skipped: number
  promptsSeen: SeenPrompt[]
  remainingPrompts: string[]
  endReason: RoundEndReason
}
