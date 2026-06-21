import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from './components/Button'
import { SectionTitle } from './components/SectionTitle'
import { createRoundState, finalizeRound, tickRound, applyRoundAction } from './game/round'
import { LocalStorageCategoryStorage } from './storage/categoryStorage'
import type { Category, RoundResult, RoundState } from './types'

type ScreenState =
  | { screen: 'home' }
  | { screen: 'create' }
  | { screen: 'round'; round: RoundState }
  | { screen: 'results'; result: RoundResult }

const storage = new LocalStorageCategoryStorage()

type CreateCategoryFormProps = {
  onCancel: () => void
  onSave: (input: { name: string; rawPrompts: string }) => void
  errors: {
    name?: string
    prompts?: string
  }
}

function App() {
  const [categories, setCategories] = useState<Category[]>([])
  const [screenState, setScreenState] = useState<ScreenState>({ screen: 'home' })
  const [createErrors, setCreateErrors] = useState<{
    name?: string
    prompts?: string
  }>({})
  const lastRoundCategoryIdRef = useRef<string | null>(null)

  useEffect(() => {
    storage.initializeBuiltInsIfMissing()
    setCategories(storage.listCategories())
  }, [])

  useEffect(() => {
    if (screenState.screen !== 'round') {
      return
    }

    const intervalId = window.setInterval(() => {
      setScreenState((current) => {
        if (current.screen !== 'round') {
          return current
        }

        const nextRound = tickRound(current.round)

        if (nextRound.remainingTime === 0) {
          return {
            screen: 'results',
            result: finalizeRound(nextRound, 'timer'),
          }
        }

        return {
          screen: 'round',
          round: nextRound,
        }
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [screenState.screen])

  useEffect(() => {
    if (screenState.screen !== 'round') {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === 'ArrowRight') {
        event.preventDefault()
        handleRoundAction('correct')
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        handleRoundAction('skip')
      } else if (event.key === 'Escape') {
        event.preventDefault()
        endRound('manual')
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [screenState])

  const customCategories = useMemo(
    () => categories.filter((category) => category.source === 'custom'),
    [categories],
  )
  const builtInCategories = useMemo(
    () => categories.filter((category) => category.source === 'built_in'),
    [categories],
  )

  function refreshCategories() {
    setCategories(storage.listCategories())
  }

  function startRound(category: Category) {
    lastRoundCategoryIdRef.current = category.id
    setScreenState({
      screen: 'round',
      round: createRoundState(category),
    })
  }

  function replayLastRound() {
    const category = categories.find(
      (candidate) => candidate.id === lastRoundCategoryIdRef.current,
    )

    if (!category) {
      setScreenState({ screen: 'home' })
      return
    }

    startRound(category)
  }

  function handleRoundAction(action: 'correct' | 'skip') {
    setScreenState((current) => {
      if (current.screen !== 'round') {
        return current
      }

      return {
        screen: 'round',
        round: applyRoundAction(current.round, action),
      }
    })
  }

  function endRound(reason: 'timer' | 'manual') {
    setScreenState((current) => {
      if (current.screen !== 'round') {
        return current
      }

      return {
        screen: 'results',
        result: finalizeRound(current.round, reason),
      }
    })
  }

  function handleCreateCategory(input: { name: string; rawPrompts: string }) {
    const name = input.name.trim()
    const prompts = input.rawPrompts
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    const nextErrors: { name?: string; prompts?: string } = {}

    if (!name) {
      nextErrors.name = 'Category name is required.'
    }

    if (prompts.length === 0) {
      nextErrors.prompts = 'Add at least one prompt, one per line.'
    }

    setCreateErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    storage.createCustomCategory({
      name,
      prompts,
    })
    refreshCategories()
    setCreateErrors({})
    setScreenState({ screen: 'home' })
  }

  function handleDeleteCategory(categoryId: string) {
    storage.deleteCustomCategory(categoryId)
    refreshCategories()
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-8">
        <header className="border-b border-black pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1f7a3d]">
                Heads Up MVP
              </p>
              <h1 className="text-4xl font-black uppercase tracking-[0.06em] sm:text-6xl">
                Guess fast.
              </h1>
            </div>

            {screenState.screen !== 'home' ? (
              <Button onClick={() => setScreenState({ screen: 'home' })}>
                Home
              </Button>
            ) : null}
          </div>
        </header>

        <section className="flex flex-1 flex-col py-8">
          {screenState.screen === 'home' ? (
            <HomeScreen
              builtInCategories={builtInCategories}
              customCategories={customCategories}
              onCreateCategory={() => {
                setCreateErrors({})
                setScreenState({ screen: 'create' })
              }}
              onDeleteCategory={handleDeleteCategory}
              onStartRound={startRound}
            />
          ) : null}

          {screenState.screen === 'create' ? (
            <CreateCategoryScreen
              errors={createErrors}
              onCancel={() => setScreenState({ screen: 'home' })}
              onSave={handleCreateCategory}
            />
          ) : null}

          {screenState.screen === 'round' ? (
            <RoundScreen
              round={screenState.round}
              onCorrect={() => handleRoundAction('correct')}
              onSkip={() => handleRoundAction('skip')}
              onEndRound={() => endRound('manual')}
            />
          ) : null}

          {screenState.screen === 'results' ? (
            <ResultsScreen
              result={screenState.result}
              onPlayAgain={replayLastRound}
              onReturnHome={() => setScreenState({ screen: 'home' })}
            />
          ) : null}
        </section>
      </div>
    </main>
  )
}

type HomeScreenProps = {
  builtInCategories: Category[]
  customCategories: Category[]
  onCreateCategory: () => void
  onDeleteCategory: (categoryId: string) => void
  onStartRound: (category: Category) => void
}

function HomeScreen({
  builtInCategories,
  customCategories,
  onCreateCategory,
  onDeleteCategory,
  onStartRound,
}: HomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col gap-10">
      <section className="space-y-4">
        <p className="max-w-3xl text-lg leading-7">
          Pick a category, pass the device, and work through the prompts one at a
          time. Correct answers score points. Skips move on. The round ends after
          60 seconds.
        </p>

        <div className="flex flex-wrap gap-4">
          <Button variant="primary" onClick={onCreateCategory}>
            Create category
          </Button>
        </div>
      </section>

      <CategorySection
        title="Built-in categories"
        categories={builtInCategories}
        onStartRound={onStartRound}
      />

      <CategorySection
        title="Your categories"
        emptyMessage="No custom categories yet."
        categories={customCategories}
        onStartRound={onStartRound}
        onDeleteCategory={onDeleteCategory}
      />
    </div>
  )
}

type CategorySectionProps = {
  title: string
  categories: Category[]
  onStartRound: (category: Category) => void
  onDeleteCategory?: (categoryId: string) => void
  emptyMessage?: string
}

function CategorySection({
  title,
  categories,
  onStartRound,
  onDeleteCategory,
  emptyMessage,
}: CategorySectionProps) {
  return (
    <section className="space-y-5 border-t border-black pt-6">
      <SectionTitle>{title}</SectionTitle>

      {categories.length === 0 ? (
        <p className="text-base">{emptyMessage}</p>
      ) : (
        <ul className="space-y-4">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex flex-col gap-4 border border-black p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <h3 className="text-xl font-bold uppercase tracking-[0.06em]">
                  {category.name}
                </h3>
                <p className="text-sm uppercase tracking-[0.08em] text-[#1f7a3d]">
                  {category.prompts.length} prompts
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="primary" onClick={() => onStartRound(category)}>
                  Start round
                </Button>

                {onDeleteCategory ? (
                  <Button
                    variant="secondary"
                    onClick={() => onDeleteCategory(category.id)}
                  >
                    Delete
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function CreateCategoryScreen({
  onCancel,
  onSave,
  errors,
}: CreateCategoryFormProps) {
  const [name, setName] = useState('')
  const [rawPrompts, setRawPrompts] = useState('')

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8">
      <div className="space-y-3">
        <SectionTitle>Create category</SectionTitle>
        <p className="text-lg leading-7">
          Paste one prompt per line. People, places, films, foods — anything you
          want to guess.
        </p>
      </div>

      <form
        className="space-y-8"
        onSubmit={(event) => {
          event.preventDefault()
          onSave({ name, rawPrompts })
        }}
      >
        <label className="block space-y-3">
          <span className="block text-sm font-semibold uppercase tracking-[0.12em]">
            Category name
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full border border-black bg-white px-4 py-4 text-lg outline-none focus:border-[#1f7a3d]"
            placeholder="Example: Footballers"
          />
          {errors.name ? <p className="text-sm font-semibold">{errors.name}</p> : null}
        </label>

        <label className="block space-y-3">
          <span className="block text-sm font-semibold uppercase tracking-[0.12em]">
            Prompts
          </span>
          <textarea
            value={rawPrompts}
            onChange={(event) => setRawPrompts(event.target.value)}
            className="min-h-80 w-full border border-black bg-white px-4 py-4 text-lg outline-none focus:border-[#1f7a3d]"
            placeholder={'Lionel Messi\nCristiano Ronaldo\nMegan Rapinoe'}
          />
          <p className="text-sm uppercase tracking-[0.08em] text-[#1f7a3d]">
            One prompt per line.
          </p>
          {errors.prompts ? (
            <p className="text-sm font-semibold">{errors.prompts}</p>
          ) : null}
        </label>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="primary">
            Save category
          </Button>
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

type RoundScreenProps = {
  round: RoundState
  onCorrect: () => void
  onSkip: () => void
  onEndRound: () => void
}

function RoundScreen({ round, onCorrect, onSkip, onEndRound }: RoundScreenProps) {
  return (
    <div className="flex flex-1 flex-col justify-between gap-8">
      <div className="grid gap-4 border-b border-black pb-6 sm:grid-cols-3">
        <StatBlock label="Category" value={round.categoryName} />
        <StatBlock label="Time" value={`${round.remainingTime}s`} />
        <StatBlock label="Score" value={String(round.score)} />
      </div>

      <div className="flex flex-1 items-center justify-center border border-black px-6 py-12 text-center">
        <p className="text-4xl font-black uppercase leading-tight tracking-[0.04em] sm:text-6xl lg:text-8xl">
          {round.currentPrompt ?? 'No prompts left'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Button className="min-h-18 text-lg" fullWidth onClick={onSkip}>
            Skip
          </Button>
          <Button
            className="min-h-18 text-lg"
            fullWidth
            variant="primary"
            onClick={onCorrect}
          >
            Correct
          </Button>
        </div>

        <Button className="min-h-14" fullWidth variant="danger" onClick={onEndRound}>
          End round
        </Button>

        <p className="text-center text-sm uppercase tracking-[0.08em] text-[#1f7a3d]">
          Desktop: Enter/→ = correct, ← = skip, Esc = end round
        </p>
      </div>
    </div>
  )
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1f7a3d]">
        {label}
      </p>
      <p className="text-2xl font-black uppercase tracking-[0.05em]">{value}</p>
    </div>
  )
}

type ResultsScreenProps = {
  result: RoundResult
  onPlayAgain: () => void
  onReturnHome: () => void
}

function ResultsScreen({
  result,
  onPlayAgain,
  onReturnHome,
}: ResultsScreenProps) {
  const remaining = result.remainingPrompts.length

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8">
      <div className="space-y-3 border-b border-black pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1f7a3d]">
          {result.endReason === 'timer' ? 'Time up' : 'Round ended'}
        </p>
        <h2 className="text-5xl font-black uppercase tracking-[0.05em] sm:text-7xl">
          Score: {result.score}
        </h2>
        <p className="text-lg uppercase tracking-[0.08em]">{result.categoryName}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ResultBlock label="Correct" value={String(result.score)} />
        <ResultBlock label="Skipped" value={String(result.skipped)} />
        <ResultBlock label="Remaining" value={String(remaining)} />
      </div>

      <div className="border-t border-black pt-6">
        <h3 className="text-xl font-black uppercase tracking-[0.06em]">
          Prompts seen
        </h3>
        {result.promptsSeen.length === 0 ? (
          <p className="mt-4">No prompts were answered this round.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {result.promptsSeen.map((prompt, index) => (
              <li
                key={`${prompt.value}-${index}`}
                className="flex items-center justify-between gap-4 border-b border-neutral-300 py-3"
              >
                <span className="text-lg">{prompt.value}</span>
                <span className="text-sm font-semibold uppercase tracking-[0.1em] text-[#1f7a3d]">
                  {prompt.action}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={onPlayAgain}>
          Play again
        </Button>
        <Button onClick={onReturnHome}>Back to categories</Button>
      </div>
    </div>
  )
}

function ResultBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-black p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1f7a3d]">
        {label}
      </p>
      <p className="mt-3 text-4xl font-black uppercase tracking-[0.04em]">{value}</p>
    </div>
  )
}

export default App
