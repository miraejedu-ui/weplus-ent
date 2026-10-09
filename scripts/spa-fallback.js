import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const index = join(process.cwd(), 'dist', 'index.html')
if (!existsSync(index)) {
  console.error('dist/index.html was not created.')
  process.exit(1)
}
copyFileSync(index, join(process.cwd(), 'dist', '404.html'))
