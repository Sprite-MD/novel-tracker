import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

function loadEnv() {
  try {
    const content = readFileSync(resolve(ROOT, '.env.local'), 'utf-8')
    for (const line of content.split('\n')) {
      const m = line.match(/^([^#=][^=]*)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim()
    }
  } catch {
    console.error('Could not read .env.local')
    process.exit(1)
  }
}
loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl.includes('your_supabase')) {
  console.error('NEXT_PUBLIC_SUPABASE_URL is not set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const LOWERCASE_WORDS = new Set([
  'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'so', 'yet',
  'at', 'by', 'in', 'of', 'on', 'to', 'up', 'as', 'is', 'it',
])

function toTitleCase(str) {
  return str
    .trim()
    .split(/\s+/)
    .map((word, i) => {
      const lower = word.toLowerCase()
      if (i !== 0 && LOWERCASE_WORDS.has(lower)) return lower
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

const { data: novels, error } = await supabase.from('novels').select('id, name')
if (error) { console.error('Failed to fetch:', error.message); process.exit(1) }

const toUpdate = novels
  .map((n) => ({ id: n.id, original: n.name, updated: toTitleCase(n.name) }))
  .filter((n) => n.original !== n.updated)

if (toUpdate.length === 0) {
  console.log('All novel names are already in title case.')
  process.exit(0)
}

console.log(`Updating ${toUpdate.length} novels…`)

for (const novel of toUpdate) {
  const { error } = await supabase
    .from('novels')
    .update({ name: novel.updated })
    .eq('id', novel.id)
  if (error) {
    console.error(`  ✗ "${novel.original}": ${error.message}`)
  } else {
    console.log(`  ✓ "${novel.original}" → "${novel.updated}"`)
  }
}

console.log('\nDone.')
