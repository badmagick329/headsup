import { builtInCategories } from '../data/builtInCategories'
import type { Category } from '../types'

export interface CategoryStorage {
  initializeBuiltInsIfMissing(): void
  listCategories(): Category[]
  createCustomCategory(input: { name: string; prompts: string[] }): Category
  deleteCustomCategory(categoryId: string): void
}

const BUILT_INS_KEY = 'headsup.categories.builtins'
const CUSTOM_KEY = 'headsup.categories.custom'

function safeReadCategories(key: string): Category[] {
  const raw = window.localStorage.getItem(key)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as Category[]) : []
  } catch {
    return []
  }
}

function writeCategories(key: string, categories: Category[]) {
  window.localStorage.setItem(key, JSON.stringify(categories))
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `category-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export class LocalStorageCategoryStorage implements CategoryStorage {
  initializeBuiltInsIfMissing() {
    const existing = safeReadCategories(BUILT_INS_KEY)

    if (existing.length === 0) {
      writeCategories(BUILT_INS_KEY, builtInCategories)
    }

    if (!window.localStorage.getItem(CUSTOM_KEY)) {
      writeCategories(CUSTOM_KEY, [])
    }
  }

  listCategories() {
    const builtIns = safeReadCategories(BUILT_INS_KEY)
    const custom = safeReadCategories(CUSTOM_KEY)

    return [...builtIns, ...custom]
  }

  createCustomCategory(input: { name: string; prompts: string[] }) {
    const category: Category = {
      id: createId(),
      name: input.name,
      source: 'custom',
      prompts: input.prompts,
    }

    const current = safeReadCategories(CUSTOM_KEY)
    writeCategories(CUSTOM_KEY, [...current, category])

    return category
  }

  deleteCustomCategory(categoryId: string) {
    const current = safeReadCategories(CUSTOM_KEY)
    writeCategories(
      CUSTOM_KEY,
      current.filter((category) => category.id !== categoryId),
    )
  }
}
