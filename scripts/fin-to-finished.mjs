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

const { data: novels, error } = await supabase
  .from('novels')
  .select('id, name, chapter, status')
  .ilike('chapter', 'fin')

if (error) { console.error('Fetch failed:', error.message); process.exit(1) }

const toUpdate = novels.filter((n) => {
  const status = Array.isArray(n.status) ? n.status : (n.status ? [n.status] : [])
  return !status.includes('finished')
})

if (toUpdate.length === 0) {
  console.log('No novels need updating — all FIN entries already have Finished Reading.')
  process.exit(0)
}

console.log(`Updating ${toUpdate.length} novels…`)

for (const novel of toUpdate) {
  const current = Array.isArray(novel.status) ? novel.status : (novel.status ? [novel.status] : [])
  const updated = [...new Set([...current, 'finished'])]

  const { error } = await supabase
    .from('novels')
    .update({ status: updated })
    .eq('id', novel.id)

  if (error) {
    console.error(`  ✗ "${novel.name}": ${error.message}`)
  } else {
    console.log(`  ✓ "${novel.name}" — added Finished Reading`)
  }
}

console.log('\nDone.')
