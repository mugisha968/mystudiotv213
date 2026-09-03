import { useEffect } from 'react'

interface SeoProps {
  title?: string
  description?: string
}

const SITE_NAME = 'MyStudioTV231'

export function Seo({ title, description }: SeoProps) {
  useEffect(() => {
    const pageName = title ? `${title} — ${SITE_NAME}` : SITE_NAME

    document.title = pageName

    let metaDescription = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    )
    let ogDescription = document.querySelector<HTMLMetaElement>(
      'meta[property="og:description"]',
    )
    let ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')

    if (description) {
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.name = 'description'
        document.head.appendChild(metaDescription)
      }
      metaDescription.content = description

      if (!ogDescription) {
        ogDescription = document.createElement('meta')
        ogDescription.setAttribute('property', 'og:description')
        document.head.appendChild(ogDescription)
      }
      ogDescription.content = description
    }

    if (title) {
      if (!ogTitle) {
        ogTitle = document.createElement('meta')
        ogTitle.setAttribute('property', 'og:title')
        document.head.appendChild(ogTitle)
      }
      ogTitle.content = pageName
    }
  }, [title, description])

  return null
}