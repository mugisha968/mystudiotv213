import type { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}