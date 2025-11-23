#!/usr/bin/env tsx
/**
 * 🔄 Health Check Watch Mode
 *
 * Continuously monitors the codebase for issues and auto-fixes when possible
 */

import { execSync } from 'child_process'
import { watch } from 'fs'
import { join } from 'path'

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function exec(command: string) {
  try {
    execSync(command, { encoding: 'utf-8', stdio: 'inherit' })
  } catch (error) {
    // Ignore errors - health check will report them
  }
}

let skipBrowserCheck = false
const BROWSER_CHECK_INTERVAL = 5 // Run browser check every 5 file changes

function runHealthCheck(cycleCount: number = 0) {
  log('\n' + '='.repeat(80), 'bold')
  log(`Health Check #${cycleCount + 1} - ${new Date().toLocaleTimeString()}`, 'cyan')
  log('='.repeat(80) + '\n', 'bold')

  // Run fast health check (skip build)
  exec('pnpm health-check:fast')

  // Auto-fix depth tokens if any issues found
  log('\n🔧 Auto-fixing depth tokens...', 'yellow')
  exec('pnpm fix:depth-tokens')

  // Run browser check periodically (expensive operation)
  if (cycleCount % BROWSER_CHECK_INTERVAL === 0 && !skipBrowserCheck) {
    log('\n🌐 Running browser health check...', 'cyan')
    log('(This runs every 5 file changes to save time)\n', 'yellow')
    exec('pnpm health-check:browser')
  }

  log('\n✅ Health check cycle complete\n', 'green')
}

function main() {
  log('\n🔄 Health Check Watch Mode', 'bold')
  log('Monitoring codebase for issues...\n', 'cyan')
  log('💡 Tip: Browser checks run every 5 file changes', 'yellow')
  log('💡 Press Ctrl+C to stop\n', 'yellow')

  // Check for --skip-browser flag
  if (process.argv.includes('--skip-browser')) {
    skipBrowserCheck = true
    log('⏭️  Browser checks disabled\n', 'yellow')
  }

  let cycleCount = 0

  // Run initial health check
  runHealthCheck(cycleCount)
  cycleCount++

  // Watch for file changes
  const dirs = ['apps/web/src', 'packages/ui/src']
  let timeout: NodeJS.Timeout | null = null

  const handleChange = (eventType: string, filename: string | null) => {
    if (!filename || !filename.match(/\.(tsx?|jsx?)$/)) return

    log(`\n📝 File changed: ${filename}`, 'yellow')

    // Debounce: wait 2 seconds after last change
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      runHealthCheck(cycleCount)
      cycleCount++
    }, 2000)
  }

  for (const dir of dirs) {
    try {
      watch(dir, { recursive: true }, handleChange)
      log(`👀 Watching ${dir}`, 'cyan')
    } catch (error) {
      log(`⚠️  Failed to watch ${dir}`, 'red')
    }
  }

  log('\n✅ Watch mode started. Press Ctrl+C to stop.\n', 'green')

  // Keep process alive
  process.stdin.resume()
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\n👋 Stopping health check watch mode...', 'yellow')
  process.exit(0)
})

main()
