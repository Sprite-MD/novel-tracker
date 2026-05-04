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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Novels with a green cell (FF00FF00) in the xlsx — all should be marked liked
const LIKED = new Set([
  "A Record of a Mortal's Journey to Immortality",
  "Thrones of Magical Arcana",
  "Carefree Path of Dreams",
  "My Disciples Are All Villains",
  "The Legendary Mechanic",
  "My House of Horrors",
  "Cultivation: Starting From Simplifying",
  "Catastrophe Card King",
  "Constructing Style Wizard",
  "Cultivation: Start From Simplifying Martial Arts Techniques",
  "Witch: Accumulating Experience Through The Knight Breathing Technique",
  "Facing An Ancient God For A Year",
  "I can rewind time to prevent death",
  "Immortality Martial Arts: I Started with the Five Animals Health Fist",
  "Diary of a Dead Wizard",
  "Struggling To Survive With Regression Powers",
  "My Cultivation Starting From Archery",
  "I Become A Martial Arts God In The Chaotic Demon World",
  "Mountain Patrol Officer",
  "The Demon's Menu",
  "I Play The Horror World As A Simulation Game",
  "Ascending The Heavens As An Evil God",
  "Grinding Cultivation Toward Martial Saint",
].map(s => s.trim().toLowerCase()))

const { data: novels, error } = await supabase.from('novels').select('id, name, liked')
if (error) { console.error('Fetch failed:', error.message); process.exit(1) }

let updated = 0, skipped = 0, notFound = 0
const found = new Set()

for (const novel of novels) {
  const key = novel.name.trim().toLowerCase()
  if (!LIKED.has(key)) continue
  found.add(key)

  if (novel.liked) {
    console.log(`  — skipped (already liked): "${novel.name}"`)
    skipped++
    continue
  }

  const { error: err } = await supabase.from('novels').update({ liked: true }).eq('id', novel.id)
  if (err) {
    console.error(`  ✗ "${novel.name}": ${err.message}`)
  } else {
    console.log(`  ✓ "${novel.name}"`)
    updated++
  }
}

for (const name of LIKED) {
  if (!found.has(name)) {
    console.log(`  ? not found in DB: "${name}"`)
    notFound++
  }
}

console.log(`\nDone. ${updated} updated, ${skipped} already liked, ${notFound} not found in DB.`)
