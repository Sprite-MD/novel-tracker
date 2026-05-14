import Link from 'next/link'
import { listNovels } from '@/lib/db'
import { NovelTable } from '@/components/NovelTable'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { data: novels, error } = await listNovels()

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Novel Tracker</h1>
            <p className="text-gray-500 dark:text-zinc-500 text-sm mt-0.5">{novels.length} novels tracked</p>
          </div>
          <Link href="/stats" className="text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 text-sm">
            Stats →
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm dark:bg-red-900/30 dark:border-red-700 dark:text-red-300">
            Failed to load novels: {error}
          </div>
        )}

        <NovelTable initialNovels={novels} />
      </div>
    </main>
  )
}
