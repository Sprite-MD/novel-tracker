import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const wb = XLSX.readFile(resolve(ROOT, 'Web Novel Info Sheets.xlsx'), {
  cellStyles: true, dense: false, bookSST: true,
})
const sheetName = wb.SheetNames[0]
console.log('Sheets:', wb.SheetNames)
const ws = wb.Sheets[sheetName]

// Print first 5 cells with values to see what properties are available
let count = 0
for (const [addr, cell] of Object.entries(ws)) {
  if (addr.startsWith('!')) continue
  if (!cell.v) continue
  console.log(addr, JSON.stringify(cell))
  if (++count >= 10) break
}
