import type { PropsWithChildren } from 'react'

export function SectionTitle({ children }: PropsWithChildren) {
  return (
    <h2 className="text-2xl font-black uppercase tracking-[0.08em] text-black sm:text-3xl">
      {children}
    </h2>
  )
}
