'use client'

import Image from 'next/image'
import { Tag, TagButton } from 'pivoshenko.ui'
import type { MouseEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'

type FileRecord = {
  filename: string
  path: string
  size: string
  width: number
  height: number
}

type Wallpaper = FileRecord & {
  name: string
  tags: string[]
}

const owner = 'pivoshenko'
const repository = 'pivoshenko.wallpapers'
const repositoryPath = 'site/public/wallpapers'

function parseFilename(filename: string) {
  const [namePart = '', ...tagsArray] = filename.split('.')[0].split('_')
  const tags = tagsArray.filter(Boolean)
  const name = namePart
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

  return { name, tags }
}

function toRawDownloadUrl(filePath: string) {
  return `https://raw.githubusercontent.com/${owner}/${repository}/main/${repositoryPath}/${filePath}`
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }, (_, item) => item + 1).map((item) => (
        <div
          key={`loading-${item}`}
          className="overflow-hidden rounded border border-ui bg-bg-surface"
        >
          <div className="aspect-[16/9] animate-pulse bg-bg-raised" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-bg-raised" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-bg-raised" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function WallpaperBrowser() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [active, setActive] = useState<Wallpaper | null>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>(
    'idle',
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/files.json')
        const files: FileRecord[] = await response.json()
        setWallpapers(
          files.map((file) => {
            const parsed = parseFilename(file.filename)
            return {
              ...file,
              name: parsed.name,
              tags: parsed.tags,
            }
          }),
        )
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const tags = useMemo(
    () =>
      [...new Set(wallpapers.flatMap((wallpaper) => wallpaper.tags))].sort(
        (a, b) => a.localeCompare(b),
      ),
    [wallpapers],
  )

  const filtered = useMemo(() => {
    if (selectedTags.length === 0) return wallpapers
    return wallpapers.filter((wallpaper) =>
      selectedTags.some((tag) => wallpaper.tags.includes(tag)),
    )
  }, [selectedTags, wallpapers])

  const hasFilters = selectedTags.length > 0

  const onToggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((value) => value !== tag)
        : [...current, tag],
    )
  }

  const onClearFilters = () => {
    setSelectedTags([])
  }

  const onCopyNix = async (wallpaper: Wallpaper) => {
    const snippet = `image = pkgs.fetchurl {\n  url = "${toRawDownloadUrl(wallpaper.path)}";\n  sha256 = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";\n};`

    try {
      await navigator.clipboard.writeText(snippet)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }

    setTimeout(() => setCopyState('idle'), 1800)
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4 border-b border-ui pb-6">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagButton
              key={tag}
              active={selectedTags.includes(tag)}
              onClick={() => onToggleTag(tag)}
            >
              {tag}
            </TagButton>
          ))}
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="type-meta fg-muted hover-secondary transition-colors"
          >
            Clear filters
          </button>
        )}
      </section>

      {isLoading ? (
        <LoadingGrid />
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((wallpaper) => (
            <article
              key={wallpaper.path}
              className="group overflow-hidden rounded border border-ui bg-bg-surface"
            >
              <button
                type="button"
                aria-label={`Open ${wallpaper.name} details`}
                className="relative block aspect-[16/9] w-full overflow-hidden border-b border-faint"
                onClick={() => {
                  setActive(wallpaper)
                  setCopyState('idle')
                }}
              >
                <Image
                  src={`/wallpapers/${wallpaper.path}`}
                  alt={`${wallpaper.name} wallpaper`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </button>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="type-ui fg-title">{wallpaper.name}</h2>
                  <button
                    type="button"
                    className="type-meta fg-muted hover-secondary"
                    onClick={() => {
                      setActive(wallpaper)
                      setCopyState('idle')
                    }}
                  >
                    details
                  </button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {wallpaper.tags.slice(0, 3).map((tag) => (
                    <TagButton
                      key={`${wallpaper.path}-${tag}`}
                      active={selectedTags.includes(tag)}
                      onClick={(event: MouseEvent) => {
                        event.preventDefault()
                        event.stopPropagation()
                        onToggleTag(tag)
                      }}
                    >
                      {tag}
                    </TagButton>
                  ))}
                </div>

                <div className="flex items-center justify-between type-meta fg-muted">
                  <span>
                    {wallpaper.width}×{wallpaper.height}
                  </span>
                  <span>{wallpaper.size} MB</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {active && (
        <div
          className="fixed inset-0 z-50 bg-bg-overlay/50 p-4"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              setActive(null)
            }
          }}
        >
          <div
            className="mx-auto mt-8 max-w-3xl rounded border border-ui bg-bg-surface p-6"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="type-heading fg-primary">{active.name}</h3>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="type-meta fg-muted hover-secondary"
                >
                  close
                </button>
              </div>

              <div className="relative aspect-[16/9] overflow-hidden rounded border border-faint">
                <Image
                  src={`/wallpapers/${active.path}`}
                  alt={`${active.name} wallpaper preview`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 type-ui fg-body">
                <p>
                  <span className="fg-muted">Filename:</span> {active.filename}
                </p>
                <p>
                  <span className="fg-muted">Size:</span> {active.size} MB
                </p>
                <p>
                  <span className="fg-muted">Resolution:</span> {active.width}×
                  {active.height}
                </p>
                <p>
                  <span className="fg-muted">Aspect:</span>{' '}
                  {(active.width / active.height).toFixed(2)}:1
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {active.tags.map((tag) => (
                  <Tag key={`${active.path}-tag-${tag}`}>{tag}</Tag>
                ))}
              </div>

              <div className="rounded border border-ui bg-bg-surface p-3">
                <pre className="overflow-x-auto type-meta fg-body">{`image = pkgs.fetchurl {
  url = "${toRawDownloadUrl(active.path)}";
  sha256 = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
};`}</pre>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={toRawDownloadUrl(active.path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded border border-ui px-3 py-2 type-ui fg-primary hover:bg-bg-raised"
                >
                  Download original
                </a>
                <button
                  type="button"
                  onClick={() => onCopyNix(active)}
                  className="rounded border border-ui px-3 py-2 type-ui fg-primary hover:bg-bg-raised"
                >
                  Copy nix snippet
                </button>
                {copyState === 'copied' && (
                  <span className="type-meta text-accent-success">copied</span>
                )}
                {copyState === 'error' && (
                  <span className="type-meta text-accent-danger">
                    clipboard failed
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
