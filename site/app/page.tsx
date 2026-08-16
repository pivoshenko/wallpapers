import { WallpaperBrowser } from '@/components/wallpaper-browser'

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="type-body fg-body max-w-2xl">
          Curated collection of wallpapers.
        </p>

        <p className="type-meta fg-muted max-w-2xl">
          Wallpapers are collected from various artists and remain the property
          of their creators. See the repository for attribution and takedown
          requests.
        </p>
      </section>

      <WallpaperBrowser />
    </div>
  )
}
