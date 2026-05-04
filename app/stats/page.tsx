import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { listNovels } from '@/lib/db'
import type { Novel } from '@/lib/types'

export const dynamic = 'force-dynamic'

function StatCard({ label, value, color = 'text-gray-900 dark:text-white' }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-white border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 rounded-lg p-4 text-center">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-gray-500 dark:text-zinc-400 text-sm mt-1">{label}</div>
    </div>
  )
}

export default async function StatsPage() {
  const { data } = await listNovels()
  const list: Novel[] = [...data].sort(
    (a, b) => (b.last_read ?? '').localeCompare(a.last_read ?? '')
  )

  const total = list.length
  const finished = list.filter((n) => n.status.includes('finished')).length
  const dropped = list.filter((n) => n.status.includes('dropped')).length
  const transDropped = list.filter((n) => n.status.includes('translation_dropped')).length
  const transFinished = list.filter((n) => n.status.includes('translation_finished')).length
  const liked = list.filter((n) => n.liked).length

  const chinese = list.filter((n) => n.origin === 'chinese').length
  const korean = list.filter((n) => n.origin === 'korean').length
  const japanese = list.filter((n) => n.origin === 'japanese').length

  const recent = list.slice(0, 5)

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Reading Stats</h1>
          <Link href="/" className="text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 text-sm">
            ← Back to list
          </Link>
        </div>

        <div>
          <h2 className="text-gray-400 dark:text-zinc-500 text-xs uppercase tracking-wider mb-3">Overview</h2>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Total Tracked" value={total} color="text-teal-600 dark:text-teal-400" />
            <StatCard label="Finished" value={finished} color="text-pink-500 dark:text-pink-400" />
            <StatCard label="Liked" value={liked} color="text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div>
          <h2 className="text-gray-400 dark:text-zinc-500 text-xs uppercase tracking-wider mb-3">By Status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="Dropped" value={dropped} color="text-gray-400 dark:text-zinc-400" />
            <StatCard label="Trans Dropped" value={transDropped} color="text-amber-500 dark:text-amber-400" />
            <StatCard label="Trans Finished" value={transFinished} color="text-purple-500 dark:text-purple-400" />
          </div>
        </div>

        <div>
          <h2 className="text-gray-400 dark:text-zinc-500 text-xs uppercase tracking-wider mb-3">By Origin</h2>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Chinese" value={chinese} color="text-rose-500 dark:text-rose-400" />
            <StatCard label="Korean" value={korean} color="text-teal-600 dark:text-teal-400" />
            <StatCard label="Japanese" value={japanese} color="text-orange-500 dark:text-orange-400" />
          </div>
        </div>

        <div>
          <h2 className="text-gray-400 dark:text-zinc-500 text-xs uppercase tracking-wider mb-3">Recently Read</h2>
          <div className="bg-white border border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 rounded-lg overflow-hidden">
            {recent.length === 0 ? (
              <p className="px-4 py-6 text-gray-400 dark:text-zinc-500 text-center text-sm">No novels yet.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {recent.map((n) => (
                    <tr key={n.id} className="border-b border-gray-100 dark:border-zinc-700 last:border-0">
                      <td className="px-4 py-3 font-medium">{n.name}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-zinc-400 text-right">
                        {n.last_read
                          ? format(parseISO(n.last_read), 'MMM d, yyyy')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
