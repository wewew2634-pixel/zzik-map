#!/usr/bin/env tsx
/**
 * 🔧 Auto-fix Depth Tokens
 *
 * Automatically converts old depth token patterns to v4 naming convention:
 * - rounded-zzik-* → rounded-zzik-depth-*
 * - backdrop-blur-zzik-* → backdrop-blur-zzik-depth-*
 * - z-zzik-* → z-zzik-depth-*
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const DRY_RUN = process.argv.includes('--dry-run')

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

interface TokenReplacement {
  pattern: RegExp
  replace: (match: string, ...groups: string[]) => string
  description: string
}

const replacements: TokenReplacement[] = [
  {
    pattern: /rounded-zzik-(?!depth-)(xs|sm|md|lg|xl|full)/g,
    replace: (match, size) => `rounded-zzik-depth-${size}`,
    description: 'rounded-zzik-* → rounded-zzik-depth-*',
  },
  {
    pattern: /backdrop-blur-zzik-(?!depth-)(none|xs|sm|md|lg)/g,
    replace: (match, size) => `backdrop-blur-zzik-depth-${size}`,
    description: 'backdrop-blur-zzik-* → backdrop-blur-zzik-depth-*',
  },
  {
    pattern: /z-zzik-(?!depth-)(\d+)/g,
    replace: (match, num) => `z-zzik-depth-${num.padStart(2, '0')}`,
    description: 'z-zzik-* → z-zzik-depth-*',
  },
]

function getAllFiles(dir: string, extensions: string[]): string[] {
  let results: string[] = []

  try {
    const list = readdirSync(dir)

    for (const file of list) {
      const filePath = join(dir, file)
      const stat = statSync(filePath)

      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          results = results.concat(getAllFiles(filePath, extensions))
        }
      } else {
        if (extensions.some((ext) => file.endsWith(ext))) {
          results.push(filePath)
        }
      }
    }
  } catch (error) {
    // Ignore errors
  }

  return results
}

function fixFile(filePath: string): { fixed: boolean; changes: number } {
  const content = readFileSync(filePath, 'utf-8')
  let newContent = content
  let changes = 0

  for (const replacement of replacements) {
    const matches = newContent.match(replacement.pattern)
    if (matches) {
      changes += matches.length
      newContent = newContent.replace(replacement.pattern, replacement.replace)
    }
  }

  if (changes > 0) {
    if (!DRY_RUN) {
      writeFileSync(filePath, newContent, 'utf-8')
    }
    return { fixed: true, changes }
  }

  return { fixed: false, changes: 0 }
}

function main() {
  log('\n🔧 Auto-fixing Depth Tokens\n', 'bold')

  if (DRY_RUN) {
    log('🔍 DRY RUN MODE - No files will be modified\n', 'yellow')
  }

  const dirs = ['apps/web', 'packages/ui']
  const extensions = ['.tsx', '.ts']

  let totalFiles = 0
  let totalChanges = 0

  for (const dir of dirs) {
    log(`\nScanning ${dir}...`, 'cyan')
    const files = getAllFiles(dir, extensions)

    for (const file of files) {
      const { fixed, changes } = fixFile(file)

      if (fixed) {
        totalFiles++
        totalChanges += changes
        log(`  ✓ ${file} (${changes} changes)`, 'green')
      }
    }
  }

  log('\n' + '='.repeat(80), 'bold')
  log(
    `Summary: ${totalFiles} files fixed, ${totalChanges} changes${DRY_RUN ? ' (DRY RUN)' : ''}`,
    'green'
  )
  log('='.repeat(80) + '\n', 'bold')
}

main()
