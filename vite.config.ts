/// <reference types="vitest/config" />
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import pkg from './package.json' with { type: 'json' }

function listPublic(dir: string, prefix = ''): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? listPublic(full, `${prefix}${name}/`) : [`${prefix}${name}`]
  })
}

// Emite dist/sw.js com a lista de ativos do build e um nome de cache derivado do conteúdo.
function serviceWorkerPlugin(): Plugin {
  return {
    name: 'bytecorp-sw',
    apply: 'build',
    generateBundle(_options, bundle) {
      const hash = createHash('sha1')
      const urls = new Set<string>(['/'])
      for (const [fileName, item] of Object.entries(bundle)) {
        hash.update(fileName)
        if (fileName === 'index.html') hash.update(String((item as { source: string }).source))
        else urls.add(`/${fileName}`)
      }
      for (const file of listPublic('public')) {
        hash.update(readFileSync(join('public', file)))
        urls.add(`/${file}`)
      }
      const template = readFileSync('scripts/sw.template.js', 'utf8')
      hash.update(template)
      const cacheName = `bytecorp-${pkg.version}-${hash.digest('hex').slice(0,10)}`
      const source = template
        .replace('__CACHE_NAME__', JSON.stringify(cacheName))
        .replace('__PRECACHE__', JSON.stringify([...urls].sort()))
      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), serviceWorkerPlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    // Dois projetos: lógica em node (*.test.ts) e componentes em DOM (*.test.tsx).
    projects: [
      {
        extends: true,
        test: { name: 'node', environment: 'node', include: ['src/**/*.test.ts', 'tests/**/*.test.ts'] },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['src/test/setup.ts'],
        },
      },
    ],
  },
})
