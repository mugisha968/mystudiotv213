import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { ArticleAuthor } from '@/types'
import { Avatar } from './Avatar'
import { VerificationStatus } from '@/components/badges/VerificationStatus'
import { cn } from '@/lib/utils'

interface AuthorBylineProps {
  author: ArticleAuthor
  showDate?: boolean
  date?: string | null
  className?: string
}

export function AuthorByline({
  author,
  showDate,
  date,
  className,
}: AuthorBylineProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Avatar
        src={author.avatar_path}
        name={author.full_name}
        size="sm"
      />
      <div className="flex min-w-0 flex-col">
        <Link
          to={`/journalists/${author.id}`}
          className="truncate text-sm font-semibold text-ink-800 hover:text-brand-800"
        >
          {author.full_name || t('journalists.title')}
        </Link>
        {showDate && date && (
          <span className="text-xs text-ink-500">{date}</span>
        )}
      </div>
      <VerificationStatus
        verified={author.verified}
        blueBadge={author.blue_badge}
        className="ml-auto"
        compact
      />
    </div>
  )
}