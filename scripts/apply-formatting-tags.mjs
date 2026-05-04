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

// Extracted from xlsx — bold = translation_finished, italic = translation_dropped
// Header row and duplicates removed; names trimmed.
const BOLD_NOVELS = new Set([
  "A Record of a Mortal's Journey to Immortality",
  "A Stay at Home Dad's Restaurant in another World",
  "Archean Eon Art",
  "I Don't want to Defy the Heavens",
  "I Might Be a Fake Cultivator",
  "Imperial God Emperor",
  "Lord of All Realms",
  "Losing Money to Be a Tycoon",
  "Monarch of Evernight",
  "Netherworld Investigator",
  "Renegade Immortal",
  "The Ultimate Evolution",
  "Thrones of Magical Arcana",
  "Transcending the Nine Heavens",
  "Unique Legend",
  "Carefree Path of Dreams",
  "King of Gods",
  "A World Worth Protecting",
  "The Devil's Cage",
  "Wu Dong Qian Kun",
  "Age of Adept",
  "Assassin's Chronicle",
  "Embers Ad Infinitum",
  "Grandson Of The Holy Emperor Is A Necromancer",
  "History's Strongest Senior Brother",
  "I Shall Seal the Heavens",
  "Kumo Desu ga, Nani ka?",
  "Mages Are OP",
  "Martial God Space",
  "Overgeared",
  "Release That Witch",
  "The Desolate Era",
  "The Legendary Moonlight Sculptor",
  "The Monk That Wanted To Renounce Ascetism",
  "World of Cultivation",
  "48 Hours a Day",
  "Monster Paradise",
  "Pocket Hunting Dimension",
  "I'll Add Points To All Things",
  "Master of The End Times",
  "Picking Up Attributes From Today",
  "A Will Eternal",
  "Abe the Wizard",
  "Forty Millenniums of Cultivation",
  "Godly Model Creator",
  "I Am Really Not The Son of Providence",
  "Immortal Path to Heaven",
  "Monster Pet Evolution",
  "My Disciples Are All Villains",
  "Scholar's Advanced Technology System",
  "Spare Me Great Lord",
  "The Legendary Mechanic",
  "I am a Scarecrow and the Demon Lord of Terror",
  "Lord Xue Ying",
  "Starting With Contract Pets",
  "AFK Farming Software",
  "Mystical Journey",
  "A Wizard's Secret",
  "I Am Really Not The Lord of Demon",
  "Martial World",
  "Starting by Acting As A Bank Robber",
  "The AFK Farming Software",
  "When A Mage Revolts",
  "I Have A Martial Arts Panel",
  "Becoming an Ancestor",
  "Lord of the Mysteries",
  "Constellation Door",
  "Fantasy Simulator",
  "God-Like Extraction",
  "I Can Track Everything",
  "I Really Am Not The Lord Of Demon",
  "Museum of Deadly Beasts",
  "Nano Machine",
  "Monster Synthesis Master",
  "I Fell Into The Game With Instant Kill",
  "My House of Horrors",
  "Constructing Style Wizard",
  "An Experimental Log of the Crazy Lich",
  "Black Tech",
  "Cultivation Chat Group",
  "Godfall Chronicles",
  "Gourmet of Another World",
  "Library of Heaven's Path",
  "Nine Stars Hegemon Body",
  "Reverend Insanity",
  "Sage Monarch",
  "Summoning the Holy Sword",
  "Super gene",
  "The First Order",
  "Upgrade Specialist in Another World",
  "Ascending The Heavens As An Evil God",
].map(s => s.trim().toLowerCase()))

const ITALIC_NOVELS = new Set([
  "Genius Detective",
  "I Am the God of Games",
  "Kingdom's Bloodline",
  "Bank of the Universe",
  "Way of the Devil",
  "A World Worth Protecting",
  "Divine Card Creator",
  "Warlock's Apprentice",
  "Soul of Negary",
  "Digging to Survive",
  "Infinite Survival",
  "Witcher: I Can Extract Everything",
  "Awakening the Gluttony Talent",
  "Astral Apostle",
  "Custom Mad Demon King",
  "Cultivation: Start From Upgrading My Computer",
  "Demon Sect Cultivation: Disable Debuffs",
  "Dark Moon Era",
  "Great Doctor Ling Ran",
  "My Extraordinary Life",
  "Nightmare's Call",
  "Supreme Uprising",
  "Tales of Herding Gods",
  "Tempest of the Stellar Wars",
  "Demon Cultivator With Celestial Book",
  "Lord of Myriad Worlds",
].map(s => s.trim().toLowerCase()))

const { data: novels, error } = await supabase.from('novels').select('id, name, status')
if (error) { console.error('Fetch failed:', error.message); process.exit(1) }

let updated = 0
let skipped = 0
let notFound = 0

const boldNames = [...BOLD_NOVELS]
const italicNames = [...ITALIC_NOVELS]
const allNames = [...new Set([...boldNames, ...italicNames])]

// Track which ones we found
const found = new Set()

for (const novel of novels) {
  const key = novel.name.trim().toLowerCase()
  const isBold = BOLD_NOVELS.has(key)
  const isItalic = ITALIC_NOVELS.has(key)
  if (!isBold && !isItalic) continue

  found.add(key)

  const current = Array.isArray(novel.status) ? novel.status : []
  const next = [...current]
  if (isBold && !next.includes('translation_finished')) next.push('translation_finished')
  if (isItalic && !next.includes('translation_dropped')) next.push('translation_dropped')

  if (next.length === current.length && next.every((s, i) => s === current[i])) {
    console.log(`  — skipped (already tagged): "${novel.name}"`)
    skipped++
    continue
  }

  const { error: updateErr } = await supabase
    .from('novels')
    .update({ status: next })
    .eq('id', novel.id)

  if (updateErr) {
    console.error(`  ✗ "${novel.name}": ${updateErr.message}`)
  } else {
    const tags = [isBold && 'translation_finished', isItalic && 'translation_dropped'].filter(Boolean).join(' + ')
    console.log(`  ✓ "${novel.name}" — added ${tags}`)
    updated++
  }
}

// Report any names from the xlsx that weren't matched in the DB
for (const name of allNames) {
  if (!found.has(name)) {
    notFound++
    console.log(`  ? not found in DB: "${name}"`)
  }
}

console.log(`\nDone. ${updated} updated, ${skipped} already correct, ${notFound} not found in DB.`)
