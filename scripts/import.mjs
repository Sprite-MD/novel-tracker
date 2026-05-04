/**
 * Imports novels from a CSV file into Supabase.
 * Run from the project root: node scripts/import.mjs
 *
 * CSV column layout (Google Sheets export):
 *   0: Novel Name
 *   1: Chapter Left off on
 *   2: Last Read Date
 *   3: (empty)
 *   4: Tag — origin (Original/Korean/Japanese) or status (Translation Dropped, etc.)
 *   5: (empty)
 *   6: Like
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// Load .env.local manually (no dotenv dependency needed)
function loadEnv() {
  try {
    const content = readFileSync(resolve(ROOT, '.env.local'), 'utf-8')
    for (const line of content.split('\n')) {
      const m = line.match(/^([^#=][^=]*)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim()
    }
  } catch {
    console.error('Could not read .env.local — make sure it exists in the project root.')
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

// Parse a quoted CSV line correctly (handles commas inside "...")
function parseCsvLine(line) {
  const cols = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQuote = !inQuote; continue }
    if (ch === ',' && !inQuote) { cols.push(cur); cur = ''; continue }
    cur += ch
  }
  cols.push(cur)
  return cols.map(c => c.trim())
}

// Convert M/D/YYYY → YYYY-MM-DD, return null for missing/dash values
function parseDate(raw) {
  const s = raw.trim()
  if (!s || s === '-') return null
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  const [, mo, day, yr] = m
  return `${yr}-${mo.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function parseChapter(raw) {
  const s = raw.trim()
  if (!s || s === '-') return null
  return s
}

function parseTag(raw) {
  const s = raw.trim().toLowerCase()
  const origin = {}
  const statusMap = {
    'completed': 'finished',
    'finished reading': 'finished',
    'translation dropped': 'translation_dropped',
    'translation finished': 'translation_finished',
  }
  const originMap = {
    'original': 'chinese',
    'korean': 'korean',
    'japanese': 'japanese',
  }
  return {
    origin: originMap[s] ?? null,
    status: statusMap[s] ?? 'reading',
  }
}

// Read CSV — try the filename the user is likely to have saved
const csvPath = resolve(ROOT, 'scripts', 'novels.csv')
let csvText
try {
  csvText = readFileSync(csvPath, 'utf-8')
} catch {
  console.error(`Could not find ${csvPath}`)
  console.error('Save your CSV as scripts/novels.csv and re-run.')
  process.exit(1)
}

const lines = csvText.split('\n').filter(Boolean)
const rows = lines.slice(1) // skip header

const novels = []
for (const line of rows) {
  const cols = parseCsvLine(line)
  const name = cols[0]?.trim()
  if (!name) continue

  const { origin, status } = parseTag(cols[4] ?? '')
  novels.push({
    name,
    chapter: parseChapter(cols[1] ?? ''),
    last_read: parseDate(cols[2] ?? ''),
    origin,
    status,
    liked: (cols[6] ?? '').trim().toLowerCase() === 'like',
    notes: null,
  })
}

console.log(`Parsed ${novels.length} novels. Inserting into Supabase…`)

// Insert in batches of 50 to avoid request size limits
const BATCH = 50
let inserted = 0
for (let i = 0; i < novels.length; i += BATCH) {
  const batch = novels.slice(i, i + BATCH)
  const { error } = await supabase.from('novels').insert(batch)
  if (error) {
    console.error(`Batch ${i}–${i + batch.length} failed:`, error.message)
    process.exit(1)
  }
  inserted += batch.length
  console.log(`  ✓ ${inserted}/${novels.length}`)
}

console.log(`\nDone! ${inserted} novels imported.`)
